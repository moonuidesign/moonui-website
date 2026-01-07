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
import { createCategory, updateCategory } from '@/server-action/category/category-actions';

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
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(
    initialData?.imageUrl || null,
  );
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
      if (file.type !== 'image/png') {
        toast.error('Only PNG format is allowed');
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
        imageUrl: uploadedImagePreview && !selectedFile ? uploadedImagePreview : '',
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
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="mb-16">
            <h1 className="text-foreground mb-4 text-5xl font-bold tracking-tight text-balance capitalize">
              {isEditMode ? `Edit ${categoryType} Category` : `Create New ${categoryType} Category`}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {isEditMode
                ? 'Update your category information and assets below'
                : 'Complete the form to create a new category for your content'}
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
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-sm font-medium">
                          Category Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Buttons"
                            className="bg-muted/30 border-border/60 hover:border-border h-14 text-base transition-colors"
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
                        <div className="mb-3 flex items-center justify-between">
                          <FormLabel className="text-foreground text-sm font-medium">
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
                            <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border h-14 transition-colors">
                              <SelectValue placeholder="Select a parent category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="root">No Parent (Root)</SelectItem>
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Cover Image
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    className="hidden"
                    id={`image-upload-${categoryType}`}
                    onChange={handleImageUpload}
                    disabled={isPending}
                  />

                  {!uploadedImagePreview ? (
                    <label htmlFor={`image-upload-${categoryType}`}>
                      <div className="group border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30 relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="bg-primary/10 rounded-full p-4 transition-transform group-hover:scale-110">
                            <ImageIcon className="text-primary h-8 w-8" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-foreground text-base font-medium">
                              Click to upload image
                            </p>
                            <p className="text-muted-foreground text-sm">PNG only, up to 5MB</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ) : (
                    <div className="border-border/60 bg-muted/30 relative aspect-video w-full overflow-hidden rounded-lg border">
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
                          if (fileInputRef.current) fileInputRef.current.value = '';
                          form.setValue('imageUrl', '');
                        }}
                        className="absolute top-2 right-2 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {/* ACTIONS */}
              <div className="flex flex-col gap-4 pt-8 md:flex-row">
                <Button
                  type="submit"
                  disabled={isPending || isDeleting}
                  className="bg-primary hover:bg-primary/90 h-14 w-full text-base font-semibold transition-all"
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
                    <span>{isEditMode ? 'Update Category' : 'Create Category'}</span>
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
