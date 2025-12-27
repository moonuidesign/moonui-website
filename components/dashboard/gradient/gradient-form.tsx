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
  FileUp,
  Sparkles,
  Image as ImageIcon,
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

export default function GradientForm({
  categories,
  gradient,
}: GradientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [imagePreview, setImagePreview] = useState<string | null>(
    gradient?.image || null,
  );
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
        .catch(() => { });
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
          <div className="mb-16">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              {isEditMode ? 'Edit Gradient' : 'Create New Gradient'}
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
                      <FormLabel className="text-sm font-medium text-foreground mb-3 block">
                        Category
                      </FormLabel>
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
                                  txtField.onChange(
                                    e.target.value.toUpperCase(),
                                  )
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
                            outputHtml={true}
                            placeholder="Write a description..."
                            minHeight="150px"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <div className="mt-2 p-2 bg-slate-950 text-slate-400 text-xs rounded border border-slate-800 font-mono overflow-auto max-h-40">
                        <p className="font-bold text-slate-200 mb-1">DEBUG: Description Value</p>
                        {JSON.stringify(field.value, null, 2)}
                      </div>
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
                            Click to upload thumbnail
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Recommended: 16:9 aspect ratio
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>

                  {imagePreview && (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                        <div className="absolute top-2 left-2 z-10 bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
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
                            if (fileInputRef.current)
                              fileInputRef.current.value = '';
                          }}
                          className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
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
        </div>
      </div>
    </>
  );
}
