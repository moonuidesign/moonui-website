'use client';

import { useState, useTransition, useRef, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Trash2, X, Palette, Crown, Sparkles, Image as ImageIcon } from 'lucide-react';
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

import { createCategoryGradient } from '@/server-action/getCategoryComponent/create';
import { CategoryCombobox } from '@/components/dashboard/category-combobox';

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
import { updateContentGradient } from '@/server-action/gradient/update-gradient';
import { createContentGradient } from '@/server-action/gradient/create-gradient';
import { useRouter } from 'next/navigation';

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
}

type GradientFormProps = {
  categories: Category[];
  gradient?: GradientEntity | null;
};

export default function GradientForm({ categories, gradient }: GradientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [imagePreview, setImagePreview] = useState<string | null>(gradient?.image || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Source File State
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const sourceFileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!gradient;

  // --- HELPER: Parse Description ---
  const parseDescription = (desc: any) => {
    if (!desc) return undefined;
    if (typeof desc === 'object') return desc;
    if (typeof desc === 'string') {
      try {
        const parsed = JSON.parse(desc);
        if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
          return parsed;
        }
      } catch (e) {
        // Not JSON
      }
      return desc;
    }
    return undefined;
  };

  // --- 2. TYPE-SAFE DEFAULT VALUES ---
  const defaultValues = useMemo<ContentGradientFormValues>(() => {
    // 1. Handle Colors
    let safeColors = [{ value: '#4F46E5' }, { value: '#EC4899' }];
    if (gradient?.colors && Array.isArray(gradient.colors) && gradient.colors.length > 0) {
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
    if (gradient?.tier && GRADIENT_TIER_OPTIONS.includes(gradient.tier as GradientTierType)) {
      safeTier = gradient.tier as GradientTierType;
    }

    return {
      name: gradient?.name || '',
      colors: safeColors,
      description: parseDescription(gradient?.description),
      typeGradient: safeType,
      tier: safeTier,
      categoryGradientsId: gradient?.categoryGradientsId || '',
      slug: Array.isArray(gradient?.slug) ? (gradient?.slug as string[]) : [],
      urlBuyOneTime: gradient?.urlBuyOneTime ?? '',
      image: gradient?.image || '',
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

  const createParentCategory = async (name: string) => {
    const res = await createCategoryGradient({
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
    const parentId = form.getValues('categoryGradientsId');
    if (!parentId) {
      toast.error('Please select a parent category first');
      return null;
    }
    const res = await createCategoryGradient({
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      form.setValue('image', file, { shouldValidate: true });
    }
  };

  const router = useRouter();

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
          router.push('/dashboard/content/gradients');
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
          <div className="mb-16">
            <h1 className="text-foreground mb-4 text-5xl font-bold tracking-tight text-balance">
              {isEditMode ? 'Edit Gradient' : 'Create New Gradient'}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {isEditMode
                ? 'Update your gradient configuration.'
                : 'Publish a new gradient to the collection.'}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={(e) => form.handleSubmit(onSubmit)(e)} className="space-y-16">
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Basic Information
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categoryGradientsId"
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
                                form.setValue('categoryGradientsId', val, {
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
                          form.setValue('categoryGradientsId', val, {
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
                        disabled={!currentParentId}
                      />
                    </FormItem>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-sm font-medium">
                          Gradient Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Sunset Vibes"
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
                      name="typeGradient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground text-sm font-medium">
                            Type
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRADIENT_TYPE_OPTIONS.map((t) => (
                                <SelectItem key={t} value={t} className="capitalize">
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
                              {GRADIENT_TIER_OPTIONS.map((t) => (
                                <SelectItem key={t} value={t} className="capitalize">
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
                  <div className="flex flex-1 items-center gap-4">
                    <div className="bg-border/40 h-px flex-1" />
                    <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                      <Palette className="h-3.5 w-3.5" />
                      Color Palette
                    </h2>
                    <div className="bg-border/40 h-px flex-1" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({ value: '#000000' })}
                    className="text-primary hover:text-primary/80 hover:bg-primary/5 ml-4 h-8 text-xs font-medium"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Color
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border-border/60 bg-muted/20 flex items-center gap-3 rounded-lg border p-3"
                    >
                      <FormField
                        control={form.control}
                        name={`colors.${index}.value`}
                        render={({ field: colorField }) => (
                          <div className="border-border/40 relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-full border shadow-sm">
                            <input
                              type="color"
                              className="absolute inset-0 -top-1/4 -left-1/4 h-[150%] w-[150%] cursor-pointer border-0 p-0"
                              {...colorField}
                            />
                          </div>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`colors.${index}.value`}
                        render={({ field: txtField }) => (
                          <FormItem className="flex-1 space-y-0">
                            <FormControl>
                              <Input
                                {...txtField}
                                className="bg-background h-9 font-mono text-sm uppercase"
                                maxLength={7}
                                onChange={(e) => txtField.onChange(e.target.value.toUpperCase())}
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
                          fields.length > 1
                            ? remove(index)
                            : toast.warning('Minimum 1 color required')
                        }
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              {/* SECTION: DESCRIPTION & TAGS */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Description & Tags
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
                            initialContent={field.value as any}
                            onChange={field.onChange}
                            outputHtml={true}
                            placeholder="Write a description..."
                            minHeight="150px"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      {/* <div className="mt-2 p-2 bg-slate-950 text-slate-400 text-xs rounded border border-slate-800 font-mono overflow-auto max-h-40">
                        <p className="font-bold text-slate-200 mb-1">DEBUG: Description Value</p>
                        {JSON.stringify(field.value, null, 2)}
                      </div> */}
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
                      <FormDescription className="text-muted-foreground/80 mt-3 text-xs">
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Thumbnail
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="thumbnail-upload"
                          onChange={handleImageUpload}
                        />
                        <label htmlFor="thumbnail-upload">
                          <FormControl>
                            <div
                              className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                                form.formState.errors.image
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
                                    Click to upload thumbnail
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    Recommended: 16:9 aspect ratio
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

                  {imagePreview && (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="group border-border/60 bg-muted/30 relative aspect-video overflow-hidden rounded-lg border">
                        <div className="absolute top-2 left-2 z-10 rounded bg-green-500/80 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                          Thumbnail
                        </div>
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreview(null);
                            setSelectedFile(null);
                            form.setValue('image', '', { shouldValidate: true });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="pt-8">
                <Button
                  type="submit"
                  disabled={isPending}
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
                    <span>{isEditMode ? 'Update Gradient' : 'Publish Gradient'}</span>
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
