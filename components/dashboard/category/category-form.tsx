'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { X, Sparkles, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

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
} from '@/components/ui/select';

import {
  CategoryType,
  CategoryFormValues,
  ComponentCategorySchema,
  DesignCategorySchema,
  TemplateCategorySchema,
  GradientCategorySchema,
} from '@/server-action/category/category-validator';
import {
  createCategory,
  updateCategory,
} from '@/server-action/category/category-actions';

interface CategoryEntity {
  id: string;
  name: string;
  imageUrl?: string | null;
  parentId?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryFormProps {
  categoryType: CategoryType;
  initialData?: CategoryEntity | null;
  onSuccess?: () => void;
  availableParentCategories: CategoryEntity[];
}

const CategoryForm = ({
  categoryType,
  initialData,
  onSuccess,
  availableParentCategories,
}: CategoryFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const isEditMode = !!initialData;

  const filteredParentCategories = availableParentCategories.filter(
    (cat) => cat.id !== initialData?.id,
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(initialData?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (uploadedImagePreview && uploadedImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedImagePreview);
      }
    };
  }, [uploadedImagePreview]);

  const getFormSchema = () => {
    switch (categoryType) {
      case 'components':
        return ComponentCategorySchema;
      case 'design':
        return DesignCategorySchema;
      case 'templates':
        return TemplateCategorySchema;
      case 'gradients':
        return GradientCategorySchema;
      default:
        return ComponentCategorySchema;
    }
  };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      name: initialData?.name ?? '',
      imageUrl: initialData?.imageUrl ?? '',
      parentId: initialData?.parentId ?? '',
    },
    mode: 'onChange',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Format harus gambar');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Max 5MB');
        return;
      }
      setSelectedFile(file);
      setUploadedImagePreview(URL.createObjectURL(file));
      form.setValue('imageUrl', file.name, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    startTransition(async () => {
      const formData = new FormData();

      const submissionValues = {
        ...values,
        parentId: values.parentId || '',
        imageUrl:
          uploadedImagePreview && !selectedFile ? uploadedImagePreview : '',
      };

      formData.append('data', JSON.stringify(submissionValues));

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const executeAction = async () => {
        const res = isEditMode
          ? await updateCategory(categoryType, initialData!.id, formData)
          : await createCategory(categoryType, formData);

        if (!res?.success) {
          throw new Error(res?.error || 'Gagal menyimpan data kategori.');
        }
        return res.message;
      };

      await toast.promise(executeAction(), {
        pending: isEditMode ? 'Updating category...' : 'Creating category...',
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
      });

      if (!isEditMode) {
        form.reset();
        setUploadedImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      onSuccess?.();
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="mb-16">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4 text-balance capitalize">
              {isEditMode
                ? `Edit ${categoryType} Category`
                : `Create New ${categoryType} Category`}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {isEditMode
                ? 'Update your category information and assets below'
                : 'Complete the form to create a new category for your content'}
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Category Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Buttons"
                            className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between mb-3">
                          <FormLabel className="text-sm font-medium text-foreground">
                            Parent Category (Optional)
                          </FormLabel>
                        </div>
                        <Select
                          disabled={isPending}
                          value={field.value || 'root'}
                          onValueChange={(val) => {
                            field.onChange(val === 'root' ? '' : val);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                              <SelectValue placeholder="Select a parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="root">
                              No Parent (Root)
                            </SelectItem>
                            {filteredParentCategories.map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.name}
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

              {/* SECTION 2: IMAGES */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Cover Image
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`image-upload-${categoryType}`}
                    onChange={handleImageUpload}
                    disabled={isPending}
                  />

                  {!uploadedImagePreview ? (
                    <label htmlFor={`image-upload-${categoryType}`}>
                      <div className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-12 text-center transition-all hover:border-primary/40 hover:bg-muted/30">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                            <ImageIcon className="h-8 w-8 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-base font-medium text-foreground">
                              Click to upload image
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG, WEBP up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                      <Image
                        src={uploadedImagePreview}
                        alt="Image Preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        disabled={isPending}
                        onClick={() => {
                          setUploadedImagePreview(null);
                          setSelectedFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = '';
                          form.setValue('imageUrl', '');
                        }}
                        className="absolute right-2 top-2 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* ACTIONS */}
              <div className="pt-8 flex flex-col gap-4 md:flex-row">
                <Button
                  type="submit"
                  disabled={isPending || isDeleting}
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
                      {isEditMode ? 'Update Category' : 'Create Category'}
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
};

export default CategoryForm;
