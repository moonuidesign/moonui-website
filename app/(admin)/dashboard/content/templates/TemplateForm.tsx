'use client';

import { useState, useTransition, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  PlusCircle,
  Upload,
  X,
  Link as LinkIcon,
  Trash2,
  Smartphone,
  Crown,
  Info,
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
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { TagInput } from '@/components/ui/tag-input';

// Imports Server Actions & Types
import { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from '@/components/Contentcomponents/addCategory';
import {
  AssetItem,
  ContentTemplateFormValues,
  ContentTemplateSchema,
  TEMPLATE_PLATFORM_OPTIONS,
  TEMPLATE_STATUS_OPTIONS,
  TEMPLATE_TIER_OPTIONS,
  TemplatePlatformType,
  TemplateStatusType,
  TemplateTierType,
} from '@/server-action/templates/validator';
import { updateContentTemplate } from '@/server-action/templates/updateTemplates';
import { createContentTemplate } from '@/server-action/templates/createTemplates';

// Interface untuk Data Template dari Database (Strict Typing)
interface TemplateEntity {
  id: string;
  title: string;
  description: string | null;
  typeContent: string;
  linkTemplate: string | null;
  categoryTemplatesId: string | null;
  assetUrl: unknown; // JSONB dari DB
  tier: string;
  platform: string;
  statusContent: string;
  slug: unknown;
}

type TemplateFormProps = {
  categories: Category[];
  template?: TemplateEntity | null;
};

export function TemplateForm({ categories, template }: TemplateFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!template;

  // --- SAFE CASTING & TYPE GUARDS (Strict, No Any) ---

  // 1. Parsing AssetUrl dari JSONB
  const initialAssetUrls: AssetItem[] = Array.isArray(template?.assetUrl)
    ? (template?.assetUrl as AssetItem[])
    : [{ url: '', type: 'image' }];

  // 2. Type Guard untuk Enum Tier
  const defaultTier: TemplateTierType =
    template?.tier &&
    TEMPLATE_TIER_OPTIONS.includes(template.tier as TemplateTierType)
      ? (template.tier as TemplateTierType)
      : 'free';

  // 3. Type Guard untuk Enum Platform
  const defaultPlatform: TemplatePlatformType =
    template?.platform &&
    TEMPLATE_PLATFORM_OPTIONS.includes(
      template.platform as TemplatePlatformType,
    )
      ? (template.platform as TemplatePlatformType)
      : 'web';

  // 4. Type Guard untuk Enum Status
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
      description: template?.description ?? '',
      typeContent: template?.typeContent ?? '',
      linkTemplate: template?.linkTemplate ?? '',
      categoryTemplatesId: template?.categoryTemplatesId ?? '',
      tier: defaultTier,
      platform: defaultPlatform,
      statusContent: defaultStatus,
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
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      let result;
      if (isEditMode && template) {
        result = await updateContentTemplate(template.id, formData);
      } else {
        result = await createContentTemplate(formData);
      }

      if ('success' in result) {
        toast.success(result.success);
        if (!isEditMode) {
          form.reset();
          setImagePreviews([]);
          setSelectedFiles([]);

          // Akses ref aman di sini karena terjadi setelah event selesai (asynchronous logic)
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          // Reset hanya file upload jika edit mode
          setImagePreviews([]);
          setSelectedFiles([]);
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
          // PERBAIKAN: Bungkus handleSubmit dengan arrow function (e) => ...
          // Ini mencegah ESLint menganggap kita membaca ref saat render.
          onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
          className="space-y-8 max-w-5xl mx-auto py-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* KOLOM KIRI: Input Utama */}
            <div className="flex-1 space-y-6">
              {/* 1. Kategori */}
              <FormField
                control={form.control}
                name="categoryTemplatesId"
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
                    <FormLabel>Judul Template</FormLabel>
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
                        placeholder="Deskripsi detail template..."
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

              {/* 3. Type Content */}
              <FormField
                control={form.control}
                name="typeContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Konten</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Tipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="figma">Figma</SelectItem>
                        <SelectItem value="sketch">Sketch</SelectItem>
                        <SelectItem value="adobe-xd">Adobe XD</SelectItem>
                        <SelectItem value="react">React Code</SelectItem>
                        <SelectItem value="html">HTML/CSS</SelectItem>
                        <SelectItem value="psd">Photoshop (PSD)</SelectItem>
                        <SelectItem value="ai">Illustrator (AI)</SelectItem>
                        <SelectItem value="zip">ZIP Archive</SelectItem>
                        <SelectItem value="other">Other File</SelectItem>
                      </SelectContent>
                    </Select>
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

                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" /> Platform
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
                            {TEMPLATE_PLATFORM_OPTIONS.map((opt) => (
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
            </div>
          </div>

          {/* AREA TENGAH: Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="linkTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Preview / Original</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://..."
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* AREA BAWAH: Upload Gambar & External Assets */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Gallery & Assets</h3>

            <div className="space-y-2">
              <FormLabel>Upload Gambar Baru</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <Card
                    key={index}
                    className="relative overflow-hidden group h-32"
                  >
                    <Image
                      width={200}
                      height={200}
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveNewImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                <Card
                  className="border-dashed border-2 flex items-center justify-center h-32 hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center p-4">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">
                      Click to upload
                    </span>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <FormLabel>External Asset URLs (Optional)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAssetUrl({ url: '', type: 'image' })}
                >
                  <PlusCircle className="h-3 w-3 mr-2" /> Add URL
                </Button>
              </div>

              {assetUrlFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`assetUrls.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="https://external-image.com/..."
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
                      <FormItem className="w-32">
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
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="preview">Preview</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAssetUrl(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto md:min-w-[200px]"
              size="lg"
            >
              {isPending
                ? 'Processing...'
                : isEditMode
                ? 'Update Template'
                : 'Create Template'}
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
