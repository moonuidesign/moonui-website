'use client';

import type React from 'react';
import { useState, useTransition, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  Upload,
  X,
  LinkIcon,
  Trash2,
  Crown,
  FileUp,
  Sparkles,
  FileText,
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
} from '@/components/ui/select';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { TagInput } from '@/components/ui/tag-input';
import { useRouter } from 'next/navigation';

// Imports Server Actions & Types
// Pastikan path import ini sesuai dengan struktur project Anda
import type { Category } from '@/server-action/getCategoryComponent';
import { createCategoryTemplate } from '@/server-action/getCategoryComponent/create';
import { CategoryCombobox } from '@/components/dashboard/category-combobox';
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
  description: any;
  typeContent: string;
  urlPreview?: string | null;
  categoryTemplatesId: string | null;
  imagesUrl: unknown; // Array of { url: string, key: string }
  tier: string;
  size: string | null;
  format: string | null;
  statusContent: string;
  urlBuyOneTime: string | null;
  slug: unknown;
  linkDonwload?: string | null; // Typo di database biasanya, sesuaikan
}

type TemplateFormProps = {
  categories: Category[];
  template?: TemplateEntity | null;
};

export default function TemplateForm({
  categories,
  template,
}: TemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const isEditMode = !!template;

  // --- HELPER: Parse Description ---
  const parseDescription = (desc: any) => {
    if (!desc) return undefined;
    if (typeof desc === 'object') return desc;
    if (typeof desc === 'string') {
      try {
        const parsed = JSON.parse(desc);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {
        return desc; // Fallback plain text
      }
      return desc;
    }
    return undefined;
  };

  // --- STATE UNTUK EXISTING DATA (EDIT MODE) ---
  // existingMainFile merged into form sourceFile default value

  const [existingImages, setExistingImages] = useState<AssetItem[]>(
    Array.isArray(template?.imagesUrl)
      ? (template?.imagesUrl as AssetItem[])
      : [],
  );

  // --- STATE UNTUK NEW UPLOAD ---
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Preview Blob URL
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // File object baru (Images)

  // Removed mainFile state in favor of useForm sourceFile

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  // --- CLEANUP PREVIEWS ON UNMOUNT ---
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // --- FORM INITIALIZATION ---
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

  const form = useForm<ContentTemplateFormValues>({
    resolver: zodResolver(ContentTemplateSchema),
    defaultValues: {
      title: template?.title ?? '',
      description: parseDescription(template?.description),
      typeContent: template?.typeContent ?? '',
      linkTemplate: template?.urlPreview ?? '',
      categoryTemplatesId: template?.categoryTemplatesId ?? '',
      tier: defaultTier,
      statusContent: defaultStatus,
      urlBuyOneTime: template?.urlBuyOneTime ?? '',
      imagesUrl: existingImages, // Validation pass if not empty
      newImages: [], // New files validation
      slug: Array.isArray(template?.slug) ? (template?.slug as string[]) : [],
      sourceFile: template?.linkDonwload || '', // Map existing main file url to sourceFile
    },
  });

  const sourceFileValue = useWatch({ control: form.control, name: 'sourceFile' });

  // --- HELPER FUNCTIONS ---
  const getFileNameFromUrl = (url: string) => {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'Unknown File';
    } catch (e) {
      return 'Existing File';
    }
  };

  // --- EVENT HANDLERS ---

  // 1. Handle New Image Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Validasi sederhana (opsional)
      const validFiles = newFiles.filter(
        (file) => file.size <= 10 * 1024 * 1024,
      ); // Max 10MB

      if (validFiles.length !== newFiles.length) {
        toast.warning('Beberapa file dilewati karena lebih dari 10MB');
      }

      const mergedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(mergedFiles);
      form.setValue('newImages', mergedFiles, { shouldValidate: true });

      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // 2. Remove New Image
  const handleRemoveNewImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    form.setValue('newImages', updatedFiles, { shouldValidate: true });

    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); // Cleanup memory
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  // 3. Remove Existing Image
  const handleRemoveExistingImage = (index: number) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
    // Update form value agar validasi tetap sinkron
    form.setValue('imagesUrl', updated, { shouldDirty: true });
  };

  // 4. Remove Existing Main File (Now handled via form reset to empty string)
  // const handleRemoveExistingMainFile = ...

  // 5. Create Categories Logic
  const createParentCategory = async (name: string) => {
    const res = await createCategoryTemplate({
      name,
      parentId: null,
      imageUrl: '',
    });
    if ('error' in res) {
      toast.error(res.error);
      return null;
    }
    toast.success(res.success);
    setLocalCategories((prev) => [...prev, res.category]);
    return res.category;
  };

  const createSubCategory = async (name: string) => {
    const watchedId = form.getValues('categoryTemplatesId');
    const selectedCat = localCategories.find((c) => c.id === watchedId);
    let parentId = '';

    if (selectedCat) {
      if (selectedCat.parentId) parentId = selectedCat.parentId;
      else parentId = selectedCat.id;
    }

    if (!parentId) {
      toast.error('Please select a parent category first');
      return null;
    }

    const res = await createCategoryTemplate({
      name,
      parentId,
      imageUrl: '',
    });
    if ('error' in res) {
      toast.error(res.error);
      return null;
    }
    toast.success(res.success);
    setLocalCategories((prev) => [...prev, res.category]);
    return res.category;
  };

  // Category Filter Logic
  const parentCategories = localCategories.filter((c) => !c.parentId);
  const watchedCategoryId = useWatch({
    control: form.control,
    name: 'categoryTemplatesId',
  });
  const selectedCategory = localCategories.find(
    (c) => c.id === watchedCategoryId,
  );

  let currentParentId = '';
  let currentChildId = '';

  if (selectedCategory) {
    if (selectedCategory.parentId) {
      currentParentId = selectedCategory.parentId;
      currentChildId = selectedCategory.id;
    } else {
      currentParentId = selectedCategory.id;
      currentChildId = '';
    }
  }

  const childCategories = localCategories.filter(
    (c) => c.parentId === currentParentId,
  );

  // --- SUBMIT HANDLER ---
  const onSubmit = (values: ContentTemplateFormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();

        // ---------------------------------------------------------
        // PERBAIKAN: Bungkus data teks ke dalam satu field 'data' (JSON)
        // ---------------------------------------------------------
        const payload = {
          title: values.title,
          description: values.description, // Kirim object aslinya, nanti ter-stringify otomatis
          typeContent: values.typeContent,
          linkTemplate: values.linkTemplate,
          categoryTemplatesId: values.categoryTemplatesId,
          tier: values.tier,
          statusContent: values.statusContent,
          urlBuyOneTime: values.urlBuyOneTime,
          slug: values.slug,
          imagesUrl: existingImages, // Penting: sertakan existing images agar validasi Zod di server lolos
        };

        // Append JSON string ke field 'data' sesuai permintaan Server Action
        formData.append('data', JSON.stringify(payload));

        // ---------------------------------------------------------
        // File Handling (Biarkan terpisah seperti sebelumnya)
        // ---------------------------------------------------------

        // 1. Handle New Images (Files)
        selectedFiles.forEach((file) => {
          formData.append('images', file); // Pastikan key-nya 'images' (sesuai server action: formData.getAll('images'))
        });

        // 2. Handle Main Template File (sourceFile)
        if (values.sourceFile instanceof File) {
          formData.append('sourceFile', values.sourceFile);
        }
        // If string, it's already in 'data' payload via existing link mapping if needed, 
        // but server action 'data' usually doesn't need the file URL explicitly if not changing.
        // However, validator might check it. Validator checks 'sourceFile' in formData or just presence?
        // The validator we updated checks 'sourceFile' field which is usually a File object in FormData.
        // BUT for update, if we don't send a new file, we might not send 'sourceFile' key in FormData at all?
        // Wait, our updated validator uses `z.union([z.instanceof(File), z.string()])`.
        // So we should pass the string if it's an existing file?
        // Server actions usually parse formData using `Object.fromEntries` or `zfd`. 
        // If we strictly rely on `formData.get('sourceFile')` it returns string or File.
        // If it's existing, we want to pass the URL string so validator passes.
        if (typeof values.sourceFile === 'string' && values.sourceFile) {
          // We append it so the validator receiving formData sees it.
          formData.append('sourceFile', values.sourceFile);
        }

        // ---------------------------------------------------------
        // Eksekusi Server Action
        // ---------------------------------------------------------
        let res;
        if (isEditMode && template) {
          // Update Mode
          formData.append('id', template.id);
          res = await updateContentTemplate(template.id, formData);
        } else {
          // Create Mode
          res = await createContentTemplate(formData);
        }

        if (res && 'error' in res) {
          toast.error(res.error);
        } else {
          toast.success(res.success || 'Template saved successfully');
          router.push('/dashboard/templates');
          router.refresh();
        }
      } catch (error) {
        console.error('Submit Error:', error);
        toast.error('Something went wrong during submission');
      }
    });
  };

  return (
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border/40" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Basic Information
                </h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryTemplatesId"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground mb-3 block">
                          Category
                        </FormLabel>
                        <FormControl>
                          <CategoryCombobox
                            categories={parentCategories}
                            value={currentParentId}
                            onChange={(val) => {
                              form.setValue('categoryTemplatesId', val, {
                                shouldValidate: true,
                              });
                            }}
                            onCreate={createParentCategory}
                            placeholder="Select Category"
                            searchPlaceholder="Search or create category..."
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground mb-3 block">
                      Sub Category
                    </FormLabel>
                    <CategoryCombobox
                      categories={childCategories}
                      value={currentChildId}
                      onChange={(val) => {
                        form.setValue('categoryTemplatesId', val, {
                          shouldValidate: true,
                        });
                      }}
                      onCreate={createSubCategory}
                      placeholder={
                        !currentParentId
                          ? 'Select Parent First'
                          : childCategories.length === 0
                            ? 'No Sub-categories'
                            : 'Select Sub Category'
                      }
                      searchPlaceholder="Search or create sub category..."
                      disabled={!currentParentId || isPending}
                    />
                  </FormItem>
                </div>

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
                          className="bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
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
                          <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="figma">Figma</SelectItem>
                          <SelectItem value="framer">Framer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* --- DESCRIPTION --- */}
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
                          outputHtml={true}
                          placeholder="Write a description for this template..."
                          minHeight="150px"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    {/* VISUAL DEBUGGER */}
                    {/* <div className="mt-2 p-2 bg-slate-950 text-slate-400 text-xs rounded border border-slate-800 font-mono overflow-auto max-h-40 whitespace-pre-wrap">
                      <p className="font-bold text-slate-200 mb-1">DEBUG: Description Value</p>
                      {String(field.value)}
                    </div> */}
                  </FormItem>
                )}
              />
            </section>

            {/* --- TAGS --- */}
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

            {/* --- LINKS --- */}
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

            {/* --- PUBLISHING SETTINGS --- */}
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
                          <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
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
                          <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
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

            {/* --- MAIN TEMPLATE FILE --- */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border/40" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileUp className="w-3.5 h-3.5" />
                  Main Template File <span className="text-destructive">*</span>
                </h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              <FormField
                control={form.control}
                name="sourceFile"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
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
                              field.onChange(file);
                              toast.success(`File ${file.name} siap diupload`);
                            }
                          }}
                          className="hidden"
                          id="main-file-upload"
                        />
                        <label htmlFor="main-file-upload">
                          <div className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${!field.value && form.formState.errors.sourceFile
                            ? 'border-destructive/50 bg-destructive/5'
                            : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
                            }`}>
                            <div className="flex flex-col items-center justify-center gap-4">
                              {field.value instanceof File ? (
                                // NEW FILE SELECTED
                                <div className="flex flex-col items-center gap-4">
                                  <div className="rounded-full bg-primary/10 p-4">
                                    <Upload className="h-8 w-8 text-primary" />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-base font-medium text-foreground">
                                      {field.value.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {(field.value.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                              ) : typeof field.value === 'string' && field.value !== '' ? (
                                // EXISTING FILE
                                <div className="flex flex-col items-center gap-4">
                                  <div className="rounded-full bg-emerald-500/10 p-4">
                                    <FileText className="h-8 w-8 text-emerald-600" />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-base font-medium text-foreground">
                                      Existing File:{' '}
                                      {getFileNameFromUrl(field.value)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Click to replace with a new file
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                // EMPTY
                                <>
                                  <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                                    <Upload className="h-8 w-8 text-primary" />
                                  </div>
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

                        {field.value && (
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                field.onChange('');
                                if (mainFileInputRef.current)
                                  mainFileInputRef.current.value = '';
                                // if (existingMainFile) handleRemoveExistingMainFile(); -> No longer needed as state is gone
                              }}
                              className="mt-3 h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              {field.value instanceof File ? 'Cancel Upload' : 'Remove Existing File'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* --- PREVIEW IMAGES --- */}
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
                <FormField
                  control={form.control}
                  name="imagesUrl"
                  render={() => (
                    <FormItem>
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
                        <FormControl>
                          <div className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${form.formState.errors.imagesUrl
                            ? 'border-destructive/50 bg-destructive/5'
                            : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
                            }`}>
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
                        </FormControl>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(imagePreviews.length > 0 || existingImages.length > 0) && (
                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Loop Existing Images */}
                    {existingImages.map((img, index) => (
                      <div
                        key={`existing-${index}`}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                      >
                        <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                          Existing
                        </div>
                        <Image
                          src={img.url || '/placeholder.svg'}
                          alt={`Existing Preview ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Loop New Image Previews */}
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={`new-${index}`}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                      >
                        <div className="absolute top-2 left-2 z-10 bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                          New
                        </div>
                        <Image
                          src={preview || '/placeholder.svg'}
                          alt={`New Preview ${index + 1}`}
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

            {/* Submit Button */}
            <div className="pt-8">
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full text-base font-semibold bg-primary hover:bg-primary/90 transition-all"
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
    </div >
  );
}
