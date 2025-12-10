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
  Link as LinkIcon,
  RefreshCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { z } from 'zod'; // Import z di sini agar bisa digunakan di schema bawah

import { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from '@/components/Contentcomponents/addCategory';
import { updateContentGradient } from '@/server-action/gradient/update-gradient';
import { createContentGradient } from '@/server-action/gradient/create-gradient';

// --- 1. DEFINE CONSTANTS & SCHEMAS FIRST (Agar bisa dipakai di Component) ---
import { TagInput } from '@/components/ui/tag-input';
import {
  ContentGradientSchema,
  ContentGradientFormValues,
  GRADIENT_TYPE_OPTIONS,
  GRADIENT_TIER_OPTIONS,
  GradientType,
  GradientTierType,
} from '@/server-action/gradient/gradient-validator';

// --- INTERFACE DATABASE ---
interface GradientEntity {
  id: string;
  name: string;
  colors: unknown;
  typeGradient: string;
  image: string;
  categoryGradientsId: string | null;
  tier: string;
  slug: unknown;
}

type GradientFormProps = {
  categories: Category[];
  gradient?: GradientEntity | null;
};

export function GradientForm({ categories, gradient }: GradientFormProps) {
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
      typeGradient: safeType,
      tier: safeTier,
      categoryGradientsId: gradient?.categoryGradientsId || '',
      slug: Array.isArray(gradient?.slug) ? (gradient?.slug as string[]) : [],
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
      // Pastikan values dikirim dalam format yang benar
      formData.append('data', JSON.stringify(values));
      if (selectedFile) formData.append('image', selectedFile);

      let result;
      if (isEditMode && gradient) {
        result = await updateContentGradient(gradient.id, formData);
      } else {
        result = await createContentGradient(formData);
      }

      if (result && 'success' in result) {
        toast.success(result.success);
        if (!isEditMode) {
          form.reset();
          setImagePreview(null);
          setSelectedFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } else {
        toast.error(result?.error || 'Something went wrong');
      }
    });
  };

  const parentCategories = localCategories.filter((c) => !c.parentId);
  const childCategories = localCategories.filter((c) => c.parentId);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-6xl mx-auto py-6 px-4"
        >
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">
                {isEditMode ? 'Edit Gradient' : 'Create Gradient'}
              </h1>
              <p className="text-sm text-zinc-500">Manage your gradients.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[140px]"
              >
                {isPending ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-500" /> Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Gradient Name" {...field} />
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
                        <FormLabel>Tags / Keywords</FormLabel>
                        <FormControl>
                          <TagInput
                            tags={field.value}
                            setTags={field.onChange}
                            placeholder="Add tags..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryGradientsId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <FormLabel>Category</FormLabel>
                          <button
                            type="button"
                            onClick={() => setIsDialogOpen(true)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            + New
                          </button>
                        </div>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parentCategories.map((p) => (
                              <SelectGroup key={p.id}>
                                <SelectItem value={p.id} className="font-bold">
                                  {p.name}
                                </SelectItem>
                                {childCategories
                                  .filter((c) => c.parentId === p.id)
                                  .map((c) => (
                                    <SelectItem
                                      key={c.id}
                                      value={c.id}
                                      className="pl-6 text-zinc-600"
                                    >
                                      {c.name}
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="typeGradient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
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
                          <FormLabel className="flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Tier
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
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
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Palette className="w-4 h-4 text-zinc-500" /> Colors
                  </CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => append({ value: '#000000' })}
                    className="h-8 px-2"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <FormField
                          control={form.control}
                          name={`colors.${index}.value`}
                          render={({ field: colorField }) => (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 shadow-sm cursor-pointer relative">
                              <input
                                type="color"
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0"
                                {...colorField}
                              />
                            </div>
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name={`colors.${index}.value`}
                          render={({ field: txtField }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input
                                  {...txtField}
                                  className="font-mono uppercase text-sm"
                                  maxLength={7}
                                  onChange={(e) =>
                                    txtField.onChange(
                                      e.target.value.toUpperCase(),
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          fields.length > 2
                            ? remove(index)
                            : toast.warning('Min 2 colors')
                        }
                        disabled={fields.length <= 2}
                        className="text-zinc-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Preview */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Thumbnail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div
                      className="relative w-32 h-32 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 transition-all group shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <>
                          <Image
                            src={imagePreview}
                            alt="Thumb"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white">
                            <RefreshCcw />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 mx-auto text-zinc-300" />
                          <span className="text-[10px] text-zinc-400">
                            Upload
                          </span>
                        </div>
                      )}
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Upload Thumbnail</p>
                      <p className="text-xs text-zinc-400">PNG/JPG for SEO.</p>
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-2 h-7 text-xs"
                          onClick={() => {
                            setImagePreview(null);
                            setSelectedFile(null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = '';
                          }}
                        >
                          <X className="w-3 h-3 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
          </DialogHeader>
          <AddCategoryCommand
            parentCategories={parentCategories}
            onCategoryCreated={handleCategoryCreated}
            closeDialog={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
