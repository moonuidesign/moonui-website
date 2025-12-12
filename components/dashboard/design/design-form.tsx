'use client';

import { useState, useTransition, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  Upload,
  Crown,
  LinkIcon,
  PlusCircle,
  FileUp,
  Sparkles,
  Trash2,
  Image as ImageIcon,
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
import { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from '@/components/Contentcomponents/addCategory';
import {
  ContentDesignFormValues,
  ContentDesignSchema,
  DESIGN_STATUS_OPTIONS,
  DESIGN_TIER_OPTIONS,
  DesignStatusType,
  DesignTierType,
} from '@/server-action/designs/validator';
import { updateContentDesign } from '@/server-action/designs/updateDesign';
import { createContentDesign } from '@/server-action/designs/createDesign';
import DescriptionEditor from '@/components/text-editor/description-editor';

// Interface untuk Data Design dari Database
interface DesignEntity {
  id: string;
  title: string;
  description: any; // Gunakan 'any' untuk mengakomodasi JSONB object Tiptap
  categoryDesignsId: string | null;
  imageUrl: string | null;
  tier: string;
  linkDownload: string | null;
  urlBuyOneTime: string | null;
  statusContent: string;
  slug: unknown;
}

type DesignFormProps = {
  categories: Category[];
  design?: DesignEntity | null;
};

export default function DesignForm({ categories, design }: DesignFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- STATE FILE UPLOADS ---
  // 1. Thumbnail Image
  const [imagePreview, setImagePreview] = useState<string | null>(
    design?.imageUrl || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Source File (Zip/Rar/Fig)
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!design;

  // --- DEFAULT VALUES & TYPE GUARDS ---
  const defaultTier: DesignTierType =
    design?.tier && DESIGN_TIER_OPTIONS.includes(design.tier as DesignTierType)
      ? (design.tier as DesignTierType)
      : 'free';

  const defaultStatus: DesignStatusType =
    design?.statusContent &&
    DESIGN_STATUS_OPTIONS.includes(design.statusContent as DesignStatusType)
      ? (design.statusContent as DesignStatusType)
      : 'draft';

  const form = useForm<ContentDesignFormValues>({
    resolver: zodResolver(ContentDesignSchema),
    defaultValues: {
      title: design?.title ?? '',
      // PENTING: Gunakan undefined jika null agar tidak error tipe string vs object
      description: design?.description ?? undefined,
      categoryDesignsId: design?.categoryDesignsId ?? '',
      tier: defaultTier,
      statusContent: defaultStatus,
      urlBuyOneTime: design?.urlBuyOneTime ?? '',
      slug: Array.isArray(design?.slug) ? (design?.slug as string[]) : [],
      imageUrl: design?.imageUrl ?? undefined,
    },
  });

  // --- HANDLERS ---

  const handleCategoryCreated = (newCategory: Category) => {
    setLocalCategories((prev) => [...prev, newCategory]);
    // If created category is a child, we set it directly.
    // If it's a parent, we set it directly.
    form.setValue('categoryDesignsId', newCategory.id, {
      shouldValidate: true,
    });
    setIsDialogOpen(false);
    toast.success('Kategori berhasil dibuat');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Hanya gambar yang diperbolehkan');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Maksimal 10MB per file');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setImagePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: ContentDesignFormValues) => {
    startTransition(async () => {
      const formData = new FormData();

      // 1. Serialize Data JSON (Termasuk deskripsi rich text)
      formData.append('data', JSON.stringify(values));

      // 2. Append Thumbnail Image
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      // 3. Append Source File
      if (sourceFile) {
        formData.append('sourceFile', sourceFile);
      }

      const promise = async () => {
        let result;
        if (isEditMode && design) {
          result = await updateContentDesign(design.id, formData);
        } else {
          result = await createContentDesign(formData);
        }

        if ('error' in result) {
          throw new Error(result.error);
        }
        return result.success;
      };

      await toast
        .promise(promise(), {
          pending: isEditMode ? 'Updating design...' : 'Creating design...',
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
            setImagePreview(null);
            setSelectedFile(null);
            setSourceFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (sourceFileInputRef.current)
              sourceFileInputRef.current.value = '';
          } else {
            // Edit mode: reset files only
            setSelectedFile(null);
            setSourceFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (sourceFileInputRef.current)
              sourceFileInputRef.current.value = '';
          }
        })
        .catch(() => {});
    });
  };

  const parentCategories = localCategories.filter((c) => !c.parentId);

  // Watch category ID to derive Parent/Child state
  const watchedCategoryId = useWatch({
    control: form.control,
    name: 'categoryDesignsId',
  });

  // Derive logic
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

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              {isEditMode ? 'Edit Design' : 'Create New Design'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isEditMode
                ? 'Update your design information and assets below'
                : 'Complete the form to publish your new design resource'}
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
                  {/* Category Section with Split Logic */}
                  <div className="grid grid-cols-2 gap-6">
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
                          Add
                        </Button>
                      </div>
                      <Select
                        value={currentParentId}
                        onValueChange={(val) => {
                          // When parent changes, we set the value to the parent ID
                          // This effectively clears the child selection
                          form.setValue('categoryDesignsId', val, {
                            shouldValidate: true,
                          });
                        }}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parentCategories.map((parent) => (
                            <SelectItem key={parent.id} value={parent.id}>
                              {parent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>

                    <FormItem>
                      <div className="flex items-center justify-between mb-3">
                        <FormLabel className="text-sm font-medium text-foreground">
                          Sub Category
                        </FormLabel>
                        {/* Optional: Add Sub Category Button if needed, currently main dialog handles it */}
                      </div>
                      <Select
                        value={currentChildId}
                        onValueChange={(val) => {
                          // When child changes, we set the value to the child ID
                          form.setValue('categoryDesignsId', val, {
                            shouldValidate: true,
                          });
                        }}
                        disabled={
                          !currentParentId ||
                          childCategories.length === 0 ||
                          isPending
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                            <SelectValue
                              placeholder={
                                !currentParentId
                                  ? 'Select Parent First'
                                  : childCategories.length === 0
                                  ? 'No Sub-categories'
                                  : 'Select Sub Category'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {childCategories.map((child) => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Design Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Modern Dashboard UI"
                            className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              {DESIGN_STATUS_OPTIONS.map((opt) => (
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
                              {DESIGN_TIER_OPTIONS.map((opt) => (
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
                          placeholder="Add tags..."
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

                <FormField
                  control={form.control}
                  name="urlBuyOneTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Purchase Link (Optional)
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
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileUp className="w-3.5 h-3.5" />
                    Source File
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-medium text-foreground">
                        Main Source File
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload ZIP, RAR, or FIG file
                      </p>
                    </div>
                    {isEditMode && design?.linkDownload && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        asChild
                      >
                        <a
                          href={design.linkDownload}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download Current
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 border-dashed border-2 px-6"
                      onClick={() => sourceFileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {sourceFile ? 'Change File' : 'Upload File'}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {sourceFile ? (
                        <span className="font-medium text-foreground">
                          {sourceFile.name} (
                          {(sourceFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      ) : (
                        <span>
                          {isEditMode && design?.linkDownload
                            ? 'Existing file retained.'
                            : 'No file selected'}
                        </span>
                      )}
                    </div>
                    <input
                      ref={sourceFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setSourceFile(f);
                      }}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Thumbnail
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div
                    className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-sm">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-medium flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Change Image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-4">
                          <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-base font-medium text-foreground">
                          Upload Thumbnail
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Recommended: 16:9 aspect ratio
                        </p>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          setSelectedFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = '';
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Image
                      </Button>
                    </div>
                  )}
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
                      {isEditMode ? 'Update Design' : 'Publish Design'}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          {/* Dialog Add Category */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Create a new parent or sub-category.
                </DialogDescription>
              </DialogHeader>
              <AddCategoryCommand
                parentCategories={parentCategories}
                onCategoryCreated={handleCategoryCreated}
                closeDialog={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
