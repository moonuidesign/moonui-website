'use client';

import type React from 'react';

import { useState, useTransition, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  PlusCircle,
  Upload,
  X,
  LinkIcon,
  Trash2,
  Crown,
  FileUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { TagInput } from '@/components/ui/tag-input';

// Imports Server Actions & Types
import type { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from '@/components/Contentcomponents/addCategory';
import {
  type AssetItem,
  type ContentTemplateFormValues,
  ContentTemplateSchema,
  TEMPLATE_STATUS_OPTIONS,
  TEMPLATE_TIER_OPTIONS,
  type TemplateStatusType,
  type TemplateTierType,
} from '@/server-action/templates/validator';
import { updateContentTemplate } from '@/server-action/templates/updateTemplates';
import { createContentTemplate } from '@/server-action/templates/createTemplates';
import DescriptionEditor from '@/components/text-editor/description-editor';

// Interface Data Database
interface TemplateEntity {
  id: string;
  title: string;
  description: object;
  typeContent: string;
  linkTemplate?: string | null;
  categoryTemplatesId: string | null;
  assetUrl: unknown;
  tier: string;
  platform: string;
  statusContent: string;
  urlBuyOneTime: string | null;
  slug: unknown;
  linkDonwload?: string | null;
}

type TemplateFormProps = {
  categories: Category[];
  template?: TemplateEntity | null;
};

export default function TemplateForm({
  categories,
  template,
}: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State untuk File Upload
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mainFile, setMainFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!template;

  // --- PREPARE DEFAULT VALUES ---
  const initialAssetUrls: AssetItem[] = Array.isArray(template?.assetUrl)
    ? (template?.assetUrl as AssetItem[])
    : [{ url: '', type: 'image' }];

  const defaultTier: TemplateTierType =
    template?.tier &&
    TEMPLATE_TIER_OPTIONS.includes(template.tier as TemplateTierType)
      ? (template.tier as TemplateTierType)
      : 'free';

  const defaultStatus: TemplateStatusType =
    template?.statusContent &&
    TEMPLATE_STATUS_OPTIONS.includes(
      template.statusContent as TemplateStatusType,
    )
      ? (template.statusContent as TemplateStatusType)
      : 'draft';

  // --- FORM INITIALIZATION ---
  const form = useForm<ContentTemplateFormValues>({
    resolver: zodResolver(ContentTemplateSchema),
    defaultValues: {
      title: template?.title ?? '',
      description: template?.description ?? undefined,
      typeContent: template?.typeContent ?? '',
      linkTemplate: template?.linkTemplate ?? '',
      categoryTemplatesId: template?.categoryTemplatesId ?? '',
      tier: defaultTier,
      statusContent: defaultStatus,
      urlBuyOneTime: template?.urlBuyOneTime ?? '',
      assetUrls: initialAssetUrls,
      slug: Array.isArray(template?.slug) ? (template?.slug as string[]) : [],
    },
  });

  const {
    fields: assetUrlFields,
    append: appendAssetUrl,
    remove: removeAssetUrl,
  } = useFieldArray({
    control: form.control,
    name: 'assetUrls',
  });

  // --- HANDLERS ---

  const handleCategoryCreated = (newCategory: Category) => {
    setLocalCategories((prev) => [...prev, newCategory]);
    form.setValue('categoryTemplatesId', newCategory.id, {
      shouldValidate: true,
    });
    setIsDialogOpen(false);
    toast.success('Kategori berhasil dibuat');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Hanya gambar yang diperbolehkan');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Maksimal 10MB per file');
        return;
      }
      validFiles.push(file);
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (values: ContentTemplateFormValues) => {
    startTransition(async () => {
      const formData = new FormData();

      formData.append('data', JSON.stringify(values));

      if (mainFile) {
        formData.append('mainFile', mainFile);
      }
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const promise = async () => {
        let result;
        if (isEditMode && template) {
          result = await updateContentTemplate(template.id, formData);
        } else {
          result = await createContentTemplate(formData);
        }

        if ('error' in result) {
          throw new Error(result.error);
        }
        return result.success;
      };

      await toast
        .promise(promise(), {
          pending: isEditMode ? 'Updating template...' : 'Creating template...',
          success: {
            render({ data }) {
              return `${data}`;
            },
          },
          error: {
            render({ data }) {
              return (data as Error).message;
            },
          },
        })
        .then(() => {
          if (!isEditMode) {
            form.reset();
            setImagePreviews([]);
            setSelectedFiles([]);
            setMainFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (mainFileInputRef.current) mainFileInputRef.current.value = '';
          } else {
            setImagePreviews([]);
            setSelectedFiles([]);
            setMainFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (mainFileInputRef.current) mainFileInputRef.current.value = '';
          }
        })
        .catch(() => {});
    });
  };

  const parentCategories = localCategories.filter((c) => !c.parentId);
  const childCategories = localCategories.filter((c) => c.parentId);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              {isEditMode ? 'Edit Template' : 'Create New Template'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isEditMode
                ? 'Update your template information and assets below'
                : 'Complete the form to publish your new template to the marketplace'}
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
              className="space-y-16"
            >
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Basic Information
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="categoryTemplatesId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-3">
                          <FormLabel className="text-sm font-medium text-foreground">
                            Category
                          </FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                            className="h-8 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/5"
                          >
                            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                            Add New
                          </Button>
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parentCategories.map((parent) => (
                              <SelectGroup key={parent.id}>
                                <SelectItem
                                  value={parent.id}
                                  className="font-semibold text-foreground"
                                >
                                  {parent.name}
                                </SelectItem>
                                {childCategories
                                  .filter(
                                    (child) => child.parentId === parent.id,
                                  )
                                  .map((child) => (
                                    <SelectItem
                                      key={child.id}
                                      value={child.id}
                                      className="pl-8 text-muted-foreground"
                                    >
                                      {child.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Template Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Modern Dashboard UI Kit"
                            className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Content Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="figma">Figma Design</SelectItem>
                            <SelectItem value="sketch">Sketch File</SelectItem>
                            <SelectItem value="adobe-xd">Adobe XD</SelectItem>
                            <SelectItem value="react">React Code</SelectItem>
                            <SelectItem value="html">HTML/CSS</SelectItem>
                            <SelectItem value="psd">Photoshop (PSD)</SelectItem>
                            <SelectItem value="ai">Illustrator (AI)</SelectItem>
                            <SelectItem value="zip">ZIP Archive</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-4 hover:border-border transition-colors">
                          <DescriptionEditor
                            initialContent={field.value as any}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TagInput
                          tags={field.value || []}
                          setTags={field.onChange}
                          placeholder="Add tags for better discoverability..."
                          className="bg-muted/30"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground/80 mt-3">
                        Press Enter to add tags
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5" />
                    External Links
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="linkTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Preview / Demo Link
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                            <Input
                              placeholder="https://example.com/preview"
                              className="h-14 pl-12 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urlBuyOneTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Purchase Link
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                            <Input
                              placeholder="https://example.com/buy"
                              className="h-14 pl-12 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Publishing Settings
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="statusContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEMPLATE_STATUS_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="capitalize"
                              >
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Crown className="w-3.5 h-3.5" />
                          Access Tier
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEMPLATE_TIER_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="capitalize"
                              >
                                {opt.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileUp className="w-3.5 h-3.5" />
                    Main Template File
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div>
                  <input
                    ref={mainFileInputRef}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 100 * 1024 * 1024) {
                          toast.error('File maksimal 100MB');
                          return;
                        }
                        setMainFile(file);
                        toast.success(`File ${file.name} siap diupload`);
                      }
                    }}
                    className="hidden"
                    id="main-file-upload"
                  />
                  <label htmlFor="main-file-upload">
                    <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-12 text-center transition-all hover:border-primary/40 hover:bg-muted/30">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        {mainFile ? (
                          <div className="space-y-2">
                            <p className="text-base font-medium text-foreground">
                              {mainFile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(mainFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <p className="text-base font-medium text-foreground">
                                Click to upload main template file
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Max file size: 100MB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                  {mainFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMainFile(null);
                        if (mainFileInputRef.current)
                          mainFileInputRef.current.value = '';
                      }}
                      className="mt-3 h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove File
                    </Button>
                  )}
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Preview Images
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-12 text-center transition-all hover:border-primary/40 hover:bg-muted/30">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-base font-medium text-foreground">
                            Click to upload preview images
                          </p>
                          <p className="text-sm text-muted-foreground">
                            PNG, JPG, WEBP up to 10MB each
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>

                  {imagePreviews.length > 0 && (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                        >
                          <Image
                            src={preview || '/placeholder.svg'}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-px flex-1 bg-border/40" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Additional Asset URLs
                    </h2>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendAssetUrl({ url: '', type: 'image' })}
                    className="ml-4 h-8 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/5"
                  >
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                    Add URL
                  </Button>
                </div>

                <div className="space-y-6">
                  {assetUrlFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3">
                      <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name={`assetUrls.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="https://example.com/asset.jpg"
                                  className="h-12 bg-muted/30 border-border/60 hover:border-border transition-colors"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`assetUrls.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12 bg-muted/30 border-border/60 hover:border-border transition-colors">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="image">Image</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAssetUrl(index)}
                        className="h-12 w-12 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="pt-8">
                <Button
                  type="submit"
                  disabled={isPending}
                  size="lg"
                  className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 transition-all"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : (
                    <span>
                      {isEditMode ? 'Update Template' : 'Publish Template'}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Dialog for adding new category */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Create New Category
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a new category to organize your templates
            </DialogDescription>
          </DialogHeader>
          <AddCategoryCommand
            categories={localCategories}
            onCategoryCreated={handleCategoryCreated}
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
