'use client';

import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { Check } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Category } from '@/server-action/getCategoryComponent';
import { createCategoryComponent } from '@/server-action/getCategoryComponent/create';
type AddCategoryCommandProps = {
  parentCategories: Category[];
  onCategoryCreated: (newCategory: Category) => void;
  closeDialog: () => void;
};

export function AddCategoryCommand({
  parentCategories,
  onCategoryCreated,
  closeDialog,
}: AddCategoryCommandProps) {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState('');
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);

  const handleCreate = () => {
    if (inputValue.trim().length < 3) {
      toast.error('Nama kategori minimal 3 karakter.');
      return;
    }

    const slug = inputValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    startTransition(async () => {
      const result = await createCategoryComponent({
        name: inputValue.trim(),
        slug,
        parentId: selectedParent?.id || null,
      });

      if ('success' in result) {
        toast.success(result.success);
        onCategoryCreated(result.category); // Kirim data kembali
        closeDialog(); // Tutup dialog
      } else {
        // Di dalam blok ini, TypeScript tahu bahwa `result`
        // pasti memiliki properti `error`.
        toast.error(result.error);
      }
      // --- AKHIR PERBAIKAN ---
    });
  };

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Ketik nama kategori baru..."
        value={inputValue}
        onValueChange={setInputValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isPending) {
            e.preventDefault();
            handleCreate();
          }
        }}
      />
      <CommandList>
        <CommandEmpty>Ketik nama kategori untuk dibuat.</CommandEmpty>
        <CommandGroup heading="Pilih Kategori Induk (Opsional)">
          <CommandItem
            onSelect={() => setSelectedParent(null)}
            className="cursor-pointer"
          >
            <Check
              className={`mr-2 h-4 w-4 ${
                selectedParent === null ? 'opacity-100' : 'opacity-0'
              }`}
            />
            -- Jadikan Kategori Utama --
          </CommandItem>
          {parentCategories.map((category) => (
            <CommandItem
              key={category.id}
              value={category.name}
              onSelect={() => setSelectedParent(category)}
              className="cursor-pointer"
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  selectedParent?.id === category.id
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
              />
              {category.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <div className="p-2 border-t">
        <Button onClick={handleCreate} disabled={isPending} className="w-full">
          {isPending ? 'Menyimpan...' : `Buat Kategori "${inputValue.trim()}"`}
        </Button>
      </div>
    </Command>
  );
}
