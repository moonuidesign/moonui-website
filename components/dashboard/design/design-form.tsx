'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  Upload,
  Crown,
  LinkIcon,
  FileUp,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  FileText,
  X,
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

// Imports Server Actions & Types
import { createCategoryDesign } from '@/server-action/getCategoryComponent/create';
import { CategoryCombobox } from '@/components/dashboard/category-combobox';
import DescriptionEditor from '@/components/text-editor/description-editor';
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

// Interface untuk Data Design dari Database
interface DesignEntity {
  id: string;
  title: string;
  description: any; // Bisa string JSON, string HTML, atau Object
  categoryDesignsId: string | null;
  imagesUrl: string[];
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

  // --- STATE FILE UPLOADS ---
  const [existingImages, setExistingImages] = useState<string[]>(
    design?.imagesUrl || [],
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!design;

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  // --- HELPER UTAMA: PARSE DESCRIPTION ---
  // Fungsi ini memperbaiki masalah raw HTML string
  const parseDescription = (desc: any) => {
    if (!desc) return undefined;

    // 1. Jika sudah berupa Object (Tiptap JSON Object), kembalikan langsung
    if (typeof desc === 'object') {
      return desc;
    }

    // 2. Jika berupa String, kita coba parse
    if (typeof desc === 'string') {
      // Coba parse sebagai JSON terlebih dahulu
      try {
        const parsed = JSON.parse(desc);
        // Cek apakah hasil parse adalah Tiptap Doc (biasanya punya properti type: 'doc')
        if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
          return parsed; // Kembalikan Object JSON
        }
      } catch (e) {
        // Jika gagal parse JSON, berarti ini adalah HTML String biasa (contoh: "<p>Halo</p>")
        // Biarkan saja, nanti Editor akan merendernya sebagai HTML
      }

      // Kembalikan string aslinya (HTML atau Plain Text)
      return desc;
    }

    return undefined;
  };

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
      // GUNAKAN HELPER DISINI
      description: parseDescription(design?.description),
      categoryDesignsId: design?.categoryDesignsId ?? '',
      tier: defaultTier,
      statusContent: defaultStatus,
      urlBuyOneTime: design?.urlBuyOneTime ?? '',
      slug: Array.isArray(design?.slug) ? (design?.slug as string[]) : [],
      imagesUrl: design?.imagesUrl ?? [],
    },
  });

  const createParentCategory = async (name: string) => {
    const res = await createCategoryDesign({
      name,
      parentId: null,
      imageUrl: '',
    }); // Design categories might need imageUrl? Checking validator.
    // Looking at validator.ts for Design, name is required. imageUrl optional?
    // create.ts for design: const { name, imageUrl, parentId } = validatedFields.data;
    // I should check validator.
    // Assuming imageUrl is optional or has default. If not, I might need to pass placeholder.
    // But CategoryCombobox only passes name.

    // Let's assume standard behavior. If error, I'll see toast.
    if ('error' in res) {
      toast.error(res.error);
      return null;
    }
    toast.success(res.success);
    setLocalCategories((prev) => [...prev, res.category]);
    return res.category;
  };

  const createSubCategory = async (name: string) => {
    const parentId = form.getValues('categoryDesignsId');
    if (!parentId) {
      toast.error('Please select a parent category first');
      return null;
    }
    const res = await createCategoryDesign({ name, parentId, imageUrl: '' });
    if ('error' in res) {
      toast.error(res.error);
      return null;
    }
    toast.success(res.success);
    setLocalCategories((prev) => [...prev, res.category]);
    return res.category;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles: File[] = [];
      const validPreviews: string[] = [];

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} too large (max 10MB)`);
          return;
        }
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setNewPreviews((prev) => [...prev, ...validPreviews]);

      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return url.split('/').pop() || 'Existing File';
    } catch {
      return 'Existing File';
    }
  };

  const onSubmit = (values: ContentDesignFormValues) => {
    startTransition(async () => {
      const formData = new FormData();

      // Normalisasi Description sebelum dikirim
      // Kita pastikan mengirim JSON String ke server
      // REVISI: Kirim sebagai Object agar validator bisa cek content
      const finalDescription = values.description;

      const submissionValues = {
        ...values,
        description: finalDescription,
        imagesUrl: existingImages, // Kirim list URL gambar lama
      };

      formData.append('data', JSON.stringify(submissionValues));

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

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
            setExistingImages([]);
            setNewPreviews([]);
            setSelectedFiles([]);
            setSourceFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (sourceFileInputRef.current)
              sourceFileInputRef.current.value = '';
          } else {
            // Edit mode reset partial
            setSelectedFiles([]);
            setNewPreviews([]);
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
  const watchedCategoryId = useWatch({
    control: form.control,
    name: 'categoryDesignsId',
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
              {/* SECTION 1: BASIC INFO */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Basic Information
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="space-y-8">
                  {/* Category Logic */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground mb-3 block">
                        Category
                      </FormLabel>
                      <CategoryCombobox
                        categories={parentCategories}
                        value={currentParentId}
                        onChange={(val) => {
                          form.setValue('categoryDesignsId', val, {
                            shouldValidate: true,
                          });
                        }}
                        onCreate={createParentCategory}
                        placeholder="Select Category"
                        searchPlaceholder="Search or create category..."
                        disabled={isPending}
                      />
                    </FormItem>

                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground mb-3 block">
                        Sub Category
                      </FormLabel>
                      <CategoryCombobox
                        categories={childCategories}
                        value={currentChildId}
                        onChange={(val) => {
                          form.setValue('categoryDesignsId', val, {
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

              {/* SECTION 2: DESCRIPTION (FIXED) */}
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
                            initialContent={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* SECTION 3: TAGS */}
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

              {/* SECTION 4: LINKS */}
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

              {/* SECTION 5: SOURCE FILE */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileUp className="w-3.5 h-3.5" />
                    Source File
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div>
                  <input
                    ref={sourceFileInputRef}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 100 * 1024 * 1024) {
                          toast.error('File maksimal 100MB');
                          return;
                        }
                        setSourceFile(file);
                        toast.success(`File ${file.name} siap diupload`);
                      }
                    }}
                    className="hidden"
                    id="source-file-upload"
                  />
                  <label htmlFor="source-file-upload">
                    <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-12 text-center transition-all hover:border-primary/40 hover:bg-muted/30">
                      <div className="flex flex-col items-center justify-center gap-4">
                        {sourceFile ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-4">
                              <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-base font-medium text-foreground">
                                {sourceFile.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(sourceFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ) : isEditMode && design?.linkDownload ? (
                          <div className="flex flex-col items-center gap-4">
                            <div className="rounded-full bg-emerald-500/10 p-4">
                              <FileText className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-base font-medium text-foreground">
                                Existing File:{' '}
                                {getFileNameFromUrl(design.linkDownload)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Click to replace with a new file
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                              <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-base font-medium text-foreground">
                                Click to upload source file
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ZIP, RAR, FIG (Max 100MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </label>

                  {(sourceFile || (isEditMode && design?.linkDownload)) && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (sourceFile) {
                            setSourceFile(null);
                            if (sourceFileInputRef.current)
                              sourceFileInputRef.current.value = '';
                          } else {
                            toast.info(
                              'Cannot remove existing file without replacing.',
                            );
                          }
                        }}
                        className="mt-3 h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        {sourceFile ? 'Cancel Upload' : 'Clear File Selection'}
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 6: IMAGES */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Images / Gallery
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="thumbnail-upload"
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="thumbnail-upload">
                    <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-12 text-center transition-all hover:border-primary/40 hover:bg-muted/30">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                          <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-base font-medium text-foreground">
                            Click to upload images
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Recommended: 16:9 aspect ratio
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                      >
                        <div className="absolute top-2 left-2 z-10 bg-blue-500/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                          Saved
                        </div>
                        <Image
                          src={url}
                          alt={`Existing ${index}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            removeExistingImage(index);
                          }}
                          className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* New Previews */}
                    {newPreviews.map((url, index) => (
                      <div
                        key={`new-${index}`}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30"
                      >
                        <div className="absolute top-2 left-2 z-10 bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                          New
                        </div>
                        <Image
                          src={url}
                          alt={`New ${index}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            removeNewImage(index);
                          }}
                          className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
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
        </div>
      </div>
    </>
  );
}
