'use client';

import { useState, useTransition, useRef, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import {
  Plus,
  Trash2,
  Upload,
  X,
  Palette,
  Crown,
  Layers,
  RefreshCcw,
  PlusCircle,
  LinkIcon,
  FileUp,
  Sparkles,
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
  SelectGroup,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import Image from 'next/image';

import { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from '@/components/Contentcomponents/addCategory';
import { updateContentGradient } from '@/server-action/gradient/update-gradient';
import { createContentGradient } from '@/server-action/gradient/create-gradient';

// --- 1. DEFINE CONSTANTS & SCHEMAS FIRST ---
import { TagInput } from '@/components/ui/tag-input';
import {
  ContentGradientSchema,
  ContentGradientFormValues,
  GRADIENT_TYPE_OPTIONS,
  GRADIENT_TIER_OPTIONS,
  GradientType,
  GradientTierType,
} from '@/server-action/gradient/gradient-validator';
import DescriptionEditor from '@/components/text-editor/description-editor';

// --- INTERFACE DATABASE ---
interface GradientEntity {
  id: string;
  name: string;
  colors: unknown;
  description?: object;
  typeGradient: string;
  image: string;
  categoryGradientsId: string | null;
  tier: string;
  slug: unknown;
  urlBuyOneTime: string | null;
  linkDownload: string | null;
}

type GradientFormProps = {
  categories: Category[];
  gradient?: GradientEntity | null;
};

export default function GradientForm({
  categories,
  gradient,
}: GradientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // UI States
  const [imagePreview, setImagePreview] = useState<string | null>(
    gradient?.image || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Source File State
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!gradient;

  // --- 2. TYPE-SAFE DEFAULT VALUES ---
  const defaultValues = useMemo<ContentGradientFormValues>(() => {
    // 1. Handle Colors
    let safeColors = [{ value: '#4F46E5' }, { value: '#EC4899' }];
    if (
      gradient?.colors &&
      Array.isArray(gradient.colors) &&
      gradient.colors.length > 0
    ) {
      safeColors = gradient.colors as { value: string }[];
    }

    // 2. Handle Type (Strict Check)
    let safeType: GradientType = 'linear';
    if (
      gradient?.typeGradient &&
      GRADIENT_TYPE_OPTIONS.includes(gradient.typeGradient as GradientType)
    ) {
      safeType = gradient.typeGradient as GradientType;
    }

    // 3. Handle Tier (Strict Check)
    let safeTier: GradientTierType = 'free';
    if (
      gradient?.tier &&
      GRADIENT_TIER_OPTIONS.includes(gradient.tier as GradientTierType)
    ) {
      safeTier = gradient.tier as GradientTierType;
    }

    return {
      name: gradient?.name || '',
      colors: safeColors,
      description: gradient?.description ?? '',
      typeGradient: safeType,
      tier: safeTier,
      categoryGradientsId: gradient?.categoryGradientsId || '',
      slug: Array.isArray(gradient?.slug) ? (gradient?.slug as string[]) : [],
      urlBuyOneTime: gradient?.urlBuyOneTime ?? '',
    };
  }, [gradient]);

  const form = useForm<ContentGradientFormValues>({
    resolver: zodResolver(ContentGradientSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'colors',
  });

  // --- 4. HANDLERS ---
  const handleCategoryCreated = (newCategory: Category) => {
    setLocalCategories((prev) => [...prev, newCategory]);
    form.setValue('categoryGradientsId', newCategory.id, {
      shouldValidate: true,
    });
    setIsDialogOpen(false);
    toast.success('Category Created');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: ContentGradientFormValues) => {
    startTransition(async () => {
      const formData = new FormData();

      formData.append('data', JSON.stringify(values));
      if (selectedFile) formData.append('image', selectedFile);
      if (sourceFile) formData.append('sourceFile', sourceFile);

      const promise = async () => {
        let result;
        if (isEditMode && gradient) {
          result = await updateContentGradient(gradient.id, formData);
        } else {
          result = await createContentGradient(formData);
        }

        if (result && 'error' in result) {
          throw new Error(result.error);
        }
        return result.success;
      };

      await toast
        .promise(promise(), {
          pending: isEditMode ? 'Updating gradient...' : 'Creating gradient...',
          success: {
            render({ data }) {
              return `${data}`;
            },
          },
          error: {
            render({ data }) {
              return (data as Error).message || 'Something went wrong';
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
          }
        })
        .catch(() => {});
    });
  };

  const parentCategories = localCategories.filter((c) => !c.parentId);

  // Watch & Derive Category Logic
  const watchedCategoryId = useWatch({
    control: form.control,
    name: 'categoryGradientsId',
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
              {isEditMode ? 'Edit Gradient' : 'Create Gradient'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isEditMode
                ? 'Update your gradient configuration.'
                : 'Publish a new gradient to the collection.'}
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
              className="space-y-16"
            >
              {/* SECTION: BASIC INFO */}
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
                          form.setValue('categoryGradientsId', val, {
                            shouldValidate: true,
                          });
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parentCategories.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>

                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground mb-3 block">
                        Sub Category
                      </FormLabel>
                      <Select
                        value={currentChildId}
                        onValueChange={(val) => {
                          form.setValue('categoryGradientsId', val, {
                            shouldValidate: true,
                          });
                        }}
                        disabled={!currentParentId || childCategories.length === 0}
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
                          {childCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Gradient Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Sunset Vibes"
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
                      name="typeGradient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Type
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
                              {GRADIENT_TYPE_OPTIONS.map((t) => (
                                <SelectItem
                                  key={t}
                                  value={t}
                                  className="capitalize"
                                >
                                  {t}
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
                              {GRADIENT_TIER_OPTIONS.map((t) => (
                                <SelectItem
                                  key={t}
                                  value={t}
                                  className="capitalize"
                                >
                                  {t}
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

              {/* SECTION: COLORS */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-px flex-1 bg-border/40" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5" />
                      Color Palette
                    </h2>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({ value: '#000000' })}
                    className="ml-4 h-8 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/5"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Color
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20"
                    >
                      <FormField
                        control={form.control}
                        name={`colors.${index}.value`}
                        render={({ field: colorField }) => (
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-border/40 shadow-sm cursor-pointer relative shrink-0">
                            <input
                              type="color"
                              className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                              {...colorField}
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`colors.${index}.value`}
                        render={({ field: txtField }) => (
                          <FormItem className="space-y-0 flex-1">
                            <FormControl>
                              <Input
                                {...txtField}
                                className="h-9 font-mono uppercase text-sm bg-background"
                                maxLength={7}
                                onChange={(e) =>
                                  txtField.onChange(e.target.value.toUpperCase())
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          fields.length > 2
                            ? remove(index)
                            : toast.warning('Minimum 2 colors required')
                        }
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: DESCRIPTION & TAGS */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Description & Tags
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

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TagInput
                          tags={field.value}
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

              {/* SECTION: THUMBNAIL */}
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

              {/* SECTION: SOURCE FILE */}
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
                        Gradient Source File
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload source file (CSS, JSON, etc.) if applicable.
                      </p>
                    </div>
                    {isEditMode && gradient?.linkDownload && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        asChild
                      >
                        <a
                          href={gradient.linkDownload}
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
                          {isEditMode && gradient?.linkDownload
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
                      {isEditMode ? 'Update Gradient' : 'Publish Gradient'}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for your gradients.
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
