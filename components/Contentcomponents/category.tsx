'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { getCategoryComponents, type Category } from '@/server-action/getCategoryComponent';
import { createCategoryComponent } from '@/server-action/getCategoryComponent/create';
import { CategoryComponentSchema, type CategoryComponentFormValues } from '@/server-action/getCategoryComponent/validator';

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

// Komponen ini menerima daftar kategori yang ada untuk dropdown parent
type CategoryFormProps = {
  // Hanya kategori utama yang bisa menjadi parent
  parentCategories: Category[];
};

export function CategoryComponentForm({ parentCategories }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryComponentFormValues>({
    resolver: zodResolver(CategoryComponentSchema),
    defaultValues: {
      name: '',
      slug: '',
      parentId: '', // String kosong sebagai default "tidak ada parent"
    },
  });

  // Fungsi untuk membuat slug secara otomatis dari nama
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    form.setValue('slug', slug, { shouldValidate: true });
  };

  const onSubmit = (values: CategoryComponentFormValues) => {
    startTransition(async () => {
      const result = await createCategoryComponent(values);
      if (result.success) {
        toast.success(result.success);
        form.reset();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input
                  placeholder="Contoh: Buttons"
                  {...field}
                  onChange={handleNameChange} // Gunakan handler kustom
                  disabled={isPending}
                />
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
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="contoh: buttons"
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
              <FormLabel>Kategori Induk (Parent)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || ''}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Jadikan sebagai kategori utama" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">-- Jadikan Kategori Utama --</SelectItem>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Menyimpan...' : 'Simpan Kategori'}
        </Button>
      </form>
    </Form>
  );
}
export default async function ManageCategoriesPage() {
  // Ambil semua kategori dari server
  const allCategories = await getCategoryComponents();

  // Filter untuk mendapatkan hanya kategori utama (yang tidak punya parentId)
  // Ini mencegah membuat sub-kategori di dalam sub-kategori (hierarki 1 level)
  const parentCategories = allCategories.filter((cat) => !cat.parentId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Tambah Kategori Baru</h2>
        <CategoryComponentForm parentCategories={parentCategories} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Daftar Kategori</h2>
        {/* Di sini Anda bisa menampilkan daftar kategori yang sudah ada */}
        <ul>
          {allCategories.map((cat) => (
            <li
              key={cat.id}
              style={{ marginLeft: cat.parentId ? '20px' : '0px' }}
            >
              {cat.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
