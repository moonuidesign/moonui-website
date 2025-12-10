'use client';

// Import hooks inti dari React untuk state dan transisi
import { useState, useTransition, useRef } from 'react';
// Import untuk form handling dan validasi
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
// Import ikon dan komponen UI dari ShadCN
import { PlusCircle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
// Import notifikasi toast
import { toast } from 'react-toastify';

// Import skema validasi, server action, dan tipe data
import {
  ContentComponentFormValues,
  ContentComponentSchema,
} from '@/server-action/createComponent/component-validator';
import { createContentComponent } from '@/server-action/createComponent/createComponent';
import { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from './addCategory';

// Definisikan props yang diterima oleh komponen
type ContentComponentFormProps = {
  categories: Category[]; // Daftar kategori awal yang diambil dari server
};

export function ContentComponentForm({
  categories,
}: ContentComponentFormProps) {
  // HOOK: useTransition digunakan untuk menangani state loading tanpa memblokir UI.
  // isPending akan bernilai true saat server action sedang berjalan.
  const [isPending, startTransition] = useTransition();

  // STATE: State lokal untuk daftar kategori.
  // Kita menggunakan state lokal agar bisa memperbarui daftar ini secara real-time
  // tanpa perlu fetch ulang data dari server. Diinisialisasi dengan data dari props.
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);

  // STATE: State untuk mengontrol apakah dialog "Tambah Kategori" sedang terbuka atau tidak.
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // STATE: State untuk upload gambar
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // HOOK: useForm adalah inti dari manajemen form.
  const form = useForm<ContentComponentFormValues>({
    resolver: zodResolver(ContentComponentSchema), // Mengintegrasikan Zod untuk validasi otomatis
    defaultValues: {
      title: '',
      type: undefined,
      copyComponentTextHTML: '',
      copyComponentTextPlain: '',
      categoryComponentsId: '', // Awalnya kosong, menunggu pilihan pengguna
    },
  });

  /**
   * Menangani event paste (Ctrl+V atau Cmd+V) di dalam textarea.
   * Fungsi ini secara asinkron membaca clipboard, mendeteksi apakah kontennya
   * berasal dari Figma atau Framer, mengekstrak data yang relevan (HTML, teks, judul),
   * dan mengisi field form secara otomatis.
   *
   * @param event - Objek event clipboard dari React.
   */
  const handlePasteFromClipboard = async (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
  ) => {
    // 1. Mencegah perilaku default browser agar teks tidak langsung tertempel di textarea.
    event.preventDefault();

    try {
      // 2. Mengakses API Clipboard browser untuk membaca konten.
      // Ini membutuhkan izin dari pengguna saat pertama kali dijalankan.
      const clipboardItems = await navigator.clipboard.read();
      let htmlContent = '';
      let textContent = '';

      // 3. Mengekstrak data 'text/html' dan 'text/plain' dari clipboard.
      for (const item of clipboardItems) {
        if (item.types.includes('text/html')) {
          htmlContent = await (await item.getType('text/html')).text();
        }
        if (item.types.includes('text/plain')) {
          textContent = await (await item.getType('text/plain')).text();
        }
      }

      // 4. Logika Deteksi Canggih menggunakan Ekspresi Reguler (Regex).
      // Regex ini dirancang untuk menangani HTML entities (misalnya, '<' menjadi '&lt;')
      // dan mengabaikan huruf besar/kecil (case-insensitive).
      const figmaRegex =
        /data-metadata="(&lt;|<)!--\(figmeta\)|data-buffer="(&lt;|<)!--\(figma\)/i;
      const framerRegex = /data-framer-pasteboard/i;

      const isFigma = figmaRegex.test(htmlContent);
      const isFramer = framerRegex.test(htmlContent);

      // --- KASUS 1: Konten Terdeteksi sebagai Komponen FIGMA ---
      if (isFigma) {
        toast.success('Komponen Figma berhasil ditempel!');

        // Ekstrak baris pertama dari teks biasa untuk dijadikan judul default.
        const firstLineOfText = textContent.split('\n')[0].trim();

        // Penanganan kasus khusus: Jika teks biasa dari clipboard kosong,
        // gunakan judul yang diekstrak sebagai fallback agar validasi tidak gagal.
        const plainTextValue = textContent.trim()
          ? textContent
          : firstLineOfText;

        // Memperbarui state form menggunakan form.setValue()
        form.setValue('type', 'figma', { shouldValidate: true });
        form.setValue('copyFigmaComponentTextHTML', htmlContent, {
          shouldValidate: true,
        });
        form.setValue('copyFigmaComponentTextPlain', plainTextValue, {
          shouldValidate: true,
        });

        if (firstLineOfText) {
          form.setValue('title', firstLineOfText, { shouldValidate: true });
        } else {
          // Beri tahu pengguna jika judul tidak terdeteksi secara otomatis.
          toast.warn('Judul tidak terdeteksi, harap isi secara manual.');
        }

        // --- KASUS 2: Konten Terdeteksi sebagai Komponen FRAMER ---
      } else if (isFramer) {
        toast.success('Komponen Framer berhasil ditempel! Harap isi judul.');

        // Memperbarui state form untuk Framer.
        form.setValue('type', 'framer', { shouldValidate: true });
        form.setValue('copyFigmaComponentTextHTML', htmlContent, {
          shouldValidate: true,
        });

        // Untuk Framer, 'copyFigmaComponentTextPlain' akan diisi dari field 'title' saat submit.
        // Kita set 'placeholder' sementara agar form tidak langsung error karena field kosong,
        // dan `shouldValidate: false` agar tidak memicu validasi Zod min(1).
        form.setValue('copyFigmaComponentTextPlain', 'placeholder', {
          shouldValidate: false,
        });

        // --- KASUS 3: Konten TIDAK Terdeteksi ---
      } else {
        toast.error(
          'Gagal! Data yang ditempel bukan komponen Figma atau Framer.',
        );

        // Menampilkan pesan error langsung di form untuk pengalaman pengguna yang lebih baik.
        form.setError('copyFigmaComponentTextHTML', {
          type: 'manual',
          message:
            'Konten clipboard tidak dikenali. Harap salin ulang dari Figma/Framer.',
        });
      }
      // --- Penanganan Error API Clipboard ---
    } catch (error) {
      console.error('Clipboard API Error:', error);
      toast.error('Gagal membaca clipboard. Pastikan Anda memberikan izin.');
      form.setError('copyFigmaComponentTextHTML', {
        type: 'manual',
        message: 'Tidak dapat mengakses clipboard.',
      });
    }
  };
  // FUNGSI: Callback yang dipicu oleh komponen AddCategoryCommand setelah kategori baru berhasil dibuat.
  const handleCategoryCreated = (newCategory: Category) => {
    // 1. Perbarui state lokal dengan kategori baru. React akan otomatis me-render ulang UI.
    setLocalCategories((prevCategories) => [...prevCategories, newCategory]);

    // 2. Langsung pilih kategori yang baru dibuat di dropdown untuk kenyamanan pengguna.
    form.setValue('categoryComponentsId', newCategory.id, {
      shouldValidate: true,
    });
  };

  // FUNGSI: Handler yang dijalankan saat form disubmit (setelah lolos validasi).
  const onSubmit = (values: ContentComponentFormValues) => {
    // Penyesuaian terakhir sebelum mengirim data
    if (values.type === 'framer') {
      values.copyComponentTextPlain = values.title;
    }

    // Membungkus pemanggilan server action dalam startTransition.
    // UI akan tetap interaktif saat proses ini berjalan.
    startTransition(async () => {
      const result = await createContentComponent(values, selectedFile);
      if (result.success) {
        toast.success(result.success);
        form.reset(); // Mengosongkan form setelah berhasil
        setImagePreview(null); // Reset preview gambar
        setSelectedFile(null); // Reset file yang dipilih
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      } else {
        toast.error(result.error);
      }
    });
  };

  // FUNGSI: Handler untuk upload gambar
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        toast.error('Harap pilih file gambar (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar tidak boleh lebih dari 5MB');
        return;
      }

      setSelectedFile(file);

      // Buat preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // FUNGSI: Handler untuk menghapus gambar
  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Memformat data kategori dari state lokal untuk ditampilkan di dropdown
  const parentCategories = localCategories.filter((c) => !c.parentId);
  const childCategories = localCategories.filter((c) => c.parentId);

  return (
    // 'Fragment' <> digunakan karena kita merender form dan dialog sebagai sibling
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 1. Area Paste Komponen */}
          <div className="p-4 border-2 border-dashed rounded-lg text-center">
            <label htmlFor="paste-area" className="text-sm font-medium">
              Salin komponen dari Figma/Framer, lalu tempel di sini
            </label>
            <Textarea
              id="paste-area"
              onPaste={handlePasteFromClipboard}
              placeholder="Ctrl + V atau Cmd + V di sini"
              className="mt-2"
            />
            <FormMessage>
              {form.formState.errors.copyFigmaComponentTextHTML?.message}
            </FormMessage>
            <FormMessage>{form.formState.errors.type?.message}</FormMessage>
          </div>

          {/* 2. Field Pemilihan Kategori dengan Tombol Tambah Baru */}
          <FormField
            control={form.control}
            name="categoryComponentsId"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Kategori</FormLabel>
                  {/* Tombol ini memicu pembukaan dialog */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Tambah Baru
                  </Button>
                </div>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori untuk komponen ini" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentCategories.map((parent) => (
                      <div key={parent.id}>
                        <SelectItem value={parent.id} className="font-bold">
                          {parent.name}
                        </SelectItem>
                        {childCategories
                          .filter((child) => child.parentId === parent.id)
                          .map((child) => (
                            <SelectItem
                              key={child.id}
                              value={child.id}
                              className="pl-6"
                            >
                              - {child.name}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 3. Field Upload Gambar */}
          <div className="space-y-4">
            <FormLabel>Preview Gambar</FormLabel>
            {imagePreview ? (
              <Card className="w-full max-w-sm">
                <CardContent className="p-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-sm">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Upload gambar preview komponen
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih Gambar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <FormDescription>
              Upload gambar preview untuk komponen ini. Maksimal 5MB.
            </FormDescription>
          </div>

          {/* 4. Field Judul dan Slug */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
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
                  <Input placeholder="Slug" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display slug.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 5. Tombol Submit Utama */}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Menyimpan...' : 'Simpan Komponen'}
          </Button>
        </form>
      </Form>

      {/* 6. Dialog untuk Menambah Kategori (Command Palette) */}
      {/* Komponen ini hanya akan dirender di DOM saat 'open' bernilai true */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
            <DialogDescription>
              Ketik nama kategori. Anda bisa memilih kategori induk untuk
              membuat sub-kategori.
            </DialogDescription>
          </DialogHeader>
          {/* Komponen command palette yang dibuat terpisah */}
          <AddCategoryCommand
            parentCategories={parentCategories}
            onCategoryCreated={handleCategoryCreated} // Meneruskan callback
            closeDialog={() => setIsDialogOpen(false)} // Meneruskan fungsi untuk menutup dialog
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
