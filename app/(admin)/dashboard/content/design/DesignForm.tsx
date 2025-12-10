'use client';

import { useState, useTransition, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Upload, X, Crown, Info, RefreshCcw } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { auth } from '@/libs/auth';

// Interface untuk Data Design dari Database (Strict Typing)
interface DesignEntity {
  id: string;
  title: string;
  description: string | null;
  categoryDesignsId: string | null;
  imageUrl: string | null;
  tier: string;
  statusContent: string;
  slug: unknown;
}

type DesignFormProps = {
  categories: Category[];
  design?: DesignEntity | null;
};

export function DesignForm({ categories, design }: DesignFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Single Image State
  const [imagePreview, setImagePreview] = useState<string | null>(
    design?.imageUrl || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!design;

  // --- SAFE CASTING & TYPE GUARDS (Strict, No Any) ---

  // 1. Type Guard untuk Enum Tier
  const defaultTier: DesignTierType =
    design?.tier && DESIGN_TIER_OPTIONS.includes(design.tier as DesignTierType)
      ? (design.tier as DesignTierType)
      : 'free';

  // 2. Type Guard untuk Enum Status
  const defaultStatus: DesignStatusType =
    design?.statusContent &&
    DESIGN_STATUS_OPTIONS.includes(design.statusContent as DesignStatusType)
      ? (design.statusContent as DesignStatusType)
      : 'draft';

  const form = useForm<ContentDesignFormValues>({
    resolver: zodResolver(ContentDesignSchema),
    defaultValues: {
      title: design?.title ?? '',
      description: design?.description ?? '',
      categoryDesignsId: design?.categoryDesignsId ?? '',
      tier: defaultTier,
      statusContent: defaultStatus,
      slug: Array.isArray(design?.slug) ? (design?.slug as string[]) : [],
      imageUrl: design?.imageUrl ?? undefined,
    },
  });

  const handleCategoryCreated = (newCategory: Category) => {
    setLocalCategories((prev) => [...prev, newCategory]);
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

      formData.append('data', JSON.stringify(values));
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      let result;
      if (isEditMode && design) {
        result = await updateContentDesign(design.id, formData);
      } else {
        result = await createContentDesign(formData);
      }

      if ('success' in result) {
        toast.success(result.success);
        if (!isEditMode) {
          form.reset();
          setImagePreview(null);
          setSelectedFile(null);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          // Reset file input only
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  const parentCategories = localCategories.filter((c) => !c.parentId);
  const childCategories = localCategories.filter((c) => c.parentId);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
          className="space-y-8 max-w-5xl mx-auto py-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* KOLOM KIRI: Input Utama */}
            <div className="flex-1 space-y-6">
              {/* 1. Kategori */}
              <FormField
                control={form.control}
                name="categoryDesignsId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Kategori</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDialogOpen(true)}
                        className="h-8 text-blue-600"
                      >
                        + Baru
                      </Button>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentCategories.map((parent) => (
                          <SelectGroup key={parent.id}>
                            <SelectItem
                              value={parent.id}
                              className="font-bold text-zinc-900"
                            >
                              {parent.name}
                            </SelectItem>
                            {childCategories
                              .filter((child) => child.parentId === parent.id)
                              .map((child) => (
                                <SelectItem
                                  key={child.id}
                                  value={child.id}
                                  className="pl-6 text-zinc-600"
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

              {/* 2. Judul & Deskripsi */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Design</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Modern Dashboard UI"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi detail design..."
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug / Tags */}
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
            </div>

            {/* KOLOM KANAN: Pengaturan Tambahan */}
            <div className="w-full md:w-80 space-y-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="statusContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Info className="w-4 h-4" /> Status
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
                        <FormLabel className="flex items-center gap-2">
                          <Crown className="w-4 h-4" /> Tier
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
                </CardContent>
              </Card>

              {/* Single Image Upload */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Design Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="relative w-full aspect-video rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 transition-all group shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <>
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white">
                            <RefreshCcw />
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                          <p className="text-sm font-medium text-zinc-600">
                            Upload Image
                          </p>
                          <p className="text-xs text-zinc-400">
                            PNG/JPG up to 10MB
                          </p>
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
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-full h-8 text-xs"
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
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto md:min-w-[200px]"
              size="lg"
            >
              {isPending
                ? 'Processing...'
                : isEditMode
                ? 'Update Design'
                : 'Create Design'}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
            <DialogDescription>Masukkan nama kategori baru.</DialogDescription>
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
