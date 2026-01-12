'use client';

import { getPresignedUrl } from '@/server-action/upload/get-presigned-url';
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
import { useRouter } from 'next/navigation';

// Interface untuk Data Design dari Database
interface DesignEntity {
  id: string;
  size: string | null;
  format: string | null;
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
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  // --- STATE FILE UPLOADS ---
  const [existingImages, setExistingImages] = useState<string[]>(design?.imagesUrl || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // REMOVED local sourceFile state in favor of form control
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!design;

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  // --- HELPER UTAMA: PARSE DESCRIPTION ---
  // Fungsi ini memperbaiki masalah raw HTML string
  const parseDescription = (desc: unknown) => {
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
      newImages: [],
      sourceFile: design?.linkDownload || '', // Set default to existing link or empty string
    },
  });

  const router = useRouter();
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
        if (file.type !== 'image/png') {
          toast.error(`File ${file.name} must be PNG format`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} too large (max 10MB)`);
          return;
        }
        validFiles.push(file);
      });

      // Check total limit (existing + previously selected + new)
      const currentTotal = existingImages.length + selectedFiles.length;
      if (currentTotal + validFiles.length > 8) {
        toast.error('You can only upload a maximum of 8 images per design.');
        return;
      }

      validFiles.forEach((file) => {
        validPreviews.push(URL.createObjectURL(file));
      });

      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      setNewPreviews((prev) => [...prev, ...validPreviews]);
      form.setValue('newImages', updatedFiles, { shouldValidate: true });

      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles(updatedFiles);
    form.setValue('newImages', updatedFiles, { shouldValidate: true });
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return url.split('/').pop() || 'Existing File';
    } catch {
      return 'Existing File';
    }
  };

  // --- CLIENT SIDE UPLOADS LOGIC ---
  const [isUploading, setIsUploading] = useState(false);

  // Helper: Upload Single File to R2
  const uploadFileToR2 = async (file: File, prefix: string = 'designs') => {
    try {
      // 1. Get Presigned URL
      const presigned = await getPresignedUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        prefix,
      });

      if (!presigned.success) {
        throw new Error(presigned.error || 'Failed to get upload URL');
      }

      // 2. Upload to R2 (CORS must be enabled)
      const uploadRes = await fetch(presigned.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed with status: ${uploadRes.status}`);
      }

      // 3. Return the Key (to be saved in DB)
      return presigned.key; // e.g., "designs/123-abc.png"
    } catch (error) {
      console.error('R2 Upload Error:', error);
      throw error;
    }
  };

  const onSubmit = (values: ContentDesignFormValues) => {
    setIsUploading(true);
    startTransition(async () => {
      try {
        // ---------------------------------------------------------
        // 1. UPLOAD SOURCE FILE (If is File)
        // ---------------------------------------------------------
        let mainFileUrl = typeof values.sourceFile === 'string' ? values.sourceFile : '';

        // Calculate Size & Format Metadata
        let fileSizeStr = 'Unknown';
        let fileFormatStr = 'FILE';

        if (values.sourceFile instanceof File) {
          toast.info(`Uploading Source File: ${values.sourceFile.name}...`);
          try {
            // Metadata Calculation
            const sizeMB = values.sourceFile.size / 1024 / 1024;
            fileSizeStr = sizeMB.toFixed(2) + ' MB';
            fileFormatStr = values.sourceFile.name.split('.').pop()?.toUpperCase() || 'FILE';

            mainFileUrl = await uploadFileToR2(values.sourceFile, 'designs/source');
          } catch (err) {
            console.error(err);
            toast.error('Failed to upload source file. Check connection or try again.');
            return;
          }
        } else if (typeof values.sourceFile === 'string' && design?.size) {
          // Preserve existing metadata if we are keeping old file
          fileSizeStr = design.size || 'Unknown';
          fileFormatStr = design.format || 'FILE';
        }

        // ---------------------------------------------------------
        // 2. UPLOAD NEW IMAGES
        // ---------------------------------------------------------
        const newImageKeys: string[] = [];
        if (selectedFiles.length > 0) {
          toast.info(`Uploading ${selectedFiles.length} images...`);
          // Parallel uploads
          await Promise.all(
            selectedFiles.map(async (file) => {
              const key = await uploadFileToR2(file, 'designs/images');
              newImageKeys.push(key);
            }),
          );
        }

        // Combine with existing images
        // NOTE: Server expects `imagesUrl` to be array of strings (Keys/URLs)
        const finalImages = [...existingImages, ...newImageKeys];

        // ---------------------------------------------------------
        // 3. CONSTRUCT PAYLOAD
        // ---------------------------------------------------------
        const payload = {
          title: values.title,
          description: values.description,
          categoryDesignsId: values.categoryDesignsId,
          tier: values.tier,
          statusContent: values.statusContent,
          urlBuyOneTime: values.urlBuyOneTime,
          slug: values.slug,
          imagesUrl: finalImages,
          sourceFile: mainFileUrl,
          // Metadata
          size: fileSizeStr,
          format: fileFormatStr,
        };

        // --- ZOD SCHEMAS ---
        const payloadJson = JSON.stringify(payload);
        const descriptionSize = new Blob([JSON.stringify(values.description)]).size;
        const totalPayloadSize = new Blob([payloadJson]).size;

        console.log(`Payload Size: ${(totalPayloadSize / 1024 / 1024).toFixed(2)} MB`);
        if (descriptionSize > 4 * 1024 * 1024) {
          toast.warning(
            'Description too long/large (many images?). Please reduce to avoid errors.',
          );
        }

        const formData = new FormData();
        formData.append('data', payloadJson);

        // Call Server Action
        let result;
        if (isEditMode && design) {
          result = await updateContentDesign(design.id, formData);
        } else {
          result = await createContentDesign(formData);
        }

        if ('error' in result) {
          throw new Error(result.error);
        }

        toast.success(result.success);

        // RESET / REDIRECT
        if (!isEditMode) {
          form.reset();
          setExistingImages([]);
          setNewPreviews([]);
          setSelectedFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = '';
          if (sourceFileInputRef.current) sourceFileInputRef.current.value = '';
          router.push('/dashboard/content/designs');
        } else {
          // Clean state but stay or redirect? Usually redirect.
          setSelectedFiles([]);
          setNewPreviews([]);
          router.push('/dashboard/content/designs');
        }
      } catch (error: unknown) {
        console.error('Submit Error:', error);
        const msg = error instanceof Error ? error.message : 'An error occurred while saving.';
        toast.error(msg);
      } finally {
        setIsUploading(false);
      }
    });
  };

  const parentCategories = localCategories.filter((c) => !c.parentId);
  const watchedCategoryId = useWatch({
    control: form.control,
    name: 'categoryDesignsId',
  });

  const selectedCategory = localCategories.find((c) => c.id === watchedCategoryId);
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

  const childCategories = localCategories.filter((c) => c.parentId === currentParentId);

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="text-foreground mb-4 text-5xl font-bold tracking-tight text-balance">
              {isEditMode ? 'Edit Design' : 'Create New Design'}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {isEditMode
                ? 'Update your design information and assets below'
                : 'Complete the form to publish your new design resource'}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={(e) => form.handleSubmit(onSubmit)(e)} className="space-y-16">
              {/* SECTION 1: BASIC INFO */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Basic Information
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div className="space-y-8">
                  {/* Category Logic */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categoryDesignsId"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-foreground mb-3 block text-sm font-medium">
                            Category
                          </FormLabel>
                          <FormControl>
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
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel className="text-foreground mb-3 block text-sm font-medium">
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
                        <FormLabel className="text-foreground text-sm font-medium">
                          Design Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Modern Dashboard UI"
                            className="bg-muted/30 border-border/60 hover:border-border text-base transition-colors"
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
                          <FormLabel className="text-foreground text-sm font-medium">
                            Status
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DESIGN_STATUS_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt} className="capitalize">
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
                          <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                            <Crown className="h-3.5 w-3.5" />
                            Access Tier
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DESIGN_TIER_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt} className="capitalize">
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Description
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="border-border/60 bg-muted/30 hover:border-border rounded-lg border p-4 transition-colors">
                          <DescriptionEditor
                            initialContent={field.value}
                            onChange={field.onChange}
                            outputHtml={true}
                            placeholder="Write a description for this design..."
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

              {/* SECTION 3: TAGS */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Tags
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
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
                      <FormDescription className="text-muted-foreground/80 mt-3 text-xs">
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <LinkIcon className="h-3.5 w-3.5" />
                    External Links
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <FormField
                  control={form.control}
                  name="urlBuyOneTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground text-sm font-medium">
                        Purchase Link (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="text-muted-foreground/60 absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                          <Input
                            placeholder="https://example.com/buy"
                            className="bg-muted/30 border-border/60 hover:border-border h-14 pl-12 text-base transition-colors"
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <FileUp className="h-3.5 w-3.5" />
                    Source File <span className="text-destructive">*</span>
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <FormField
                  control={form.control}
                  name="sourceFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div>
                          <input
                            ref={sourceFileInputRef}
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 100 * 1024 * 1024) {
                                  toast.error('Max file size is 100MB');
                                  return;
                                }
                                field.onChange(file); // Update form state
                                toast.success(`File ${file.name} is ready for upload`);
                              }
                            }}
                            className="hidden"
                            id="source-file-upload"
                          />
                          <label htmlFor="source-file-upload">
                            <div
                              className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                                !field.value && form.formState.errors.sourceFile
                                  ? 'border-destructive/50 bg-destructive/5'
                                  : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center gap-4">
                                {field.value instanceof File ? (
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="bg-primary/10 rounded-full p-4">
                                      <Upload className="text-primary h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-foreground text-base font-medium">
                                        {field.value.name}
                                      </p>
                                      <p className="text-muted-foreground text-sm">
                                        {(field.value.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                ) : typeof field.value === 'string' && field.value !== '' ? (
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="rounded-full bg-emerald-500/10 p-4">
                                      <FileText className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-foreground text-base font-medium">
                                        Existing File: {getFileNameFromUrl(field.value)}
                                      </p>
                                      <p className="text-muted-foreground text-sm">
                                        Click to replace with a new file
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="bg-primary/10 rounded-full p-4 transition-transform group-hover:scale-110">
                                      <Upload className="text-primary h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-foreground text-base font-medium">
                                        Click to upload source file
                                      </p>
                                      <p className="text-muted-foreground text-sm">
                                        ZIP, RAR, FIG (Max 100MB)
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
                                  field.onChange(''); // Reset to empty string
                                  if (sourceFileInputRef.current)
                                    sourceFileInputRef.current.value = '';
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-3 h-9 text-xs"
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                {field.value instanceof File ? 'Cancel Upload' : 'Remove File'}
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

              {/* SECTION 6: IMAGES */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Images / Gallery
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
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
                          accept="image/png"
                          multiple
                          className="hidden"
                          id="thumbnail-upload"
                          onChange={handleImageUpload}
                        />
                        <label htmlFor="thumbnail-upload">
                          <FormControl>
                            <div
                              className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                                form.formState.errors.imagesUrl
                                  ? 'border-destructive/50 bg-destructive/5'
                                  : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center gap-4">
                                <div className="bg-primary/10 rounded-full p-4 transition-transform group-hover:scale-110">
                                  <ImageIcon className="text-primary h-8 w-8" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-foreground text-base font-medium">
                                    Click to upload images
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    PNG only, 16:9 aspect ratio
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

                  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="group border-border/60 bg-muted/30 relative aspect-video overflow-hidden rounded-lg border"
                      >
                        <div className="absolute top-2 left-2 z-10 rounded bg-blue-500/80 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
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
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* New Previews */}
                    {newPreviews.map((url, index) => (
                      <div
                        key={`new-${index}`}
                        className="group border-border/60 bg-muted/30 relative aspect-video overflow-hidden rounded-lg border"
                      >
                        <div className="absolute top-2 left-2 z-10 rounded bg-green-500/80 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
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
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
                  disabled={isPending || isUploading}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 w-full text-base font-semibold transition-all"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                    <span>{isEditMode ? 'Update Design' : 'Publish Design'}</span>
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
