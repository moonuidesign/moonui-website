import { Scaling, Type, Eraser, Palette, List } from 'lucide-react';

export const getSuggestionItems = ({ query }: { query: string }) => {
  const items = [
    {
      title: 'Bullet List',
      description: 'Daftar berbutir',
      icon: List,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    // --- UKURAN FONT ---
    {
      title: 'Giant Text',
      description: 'Teks Raksasa (30px)',
      icon: Scaling,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range) // Hapus "/"
          .setFontSize('30px') // Panggil command custom kita
          .run();
      },
    },
    {
      title: 'Big Text',
      description: 'Teks Besar (24px)',
      icon: Type,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setFontSize('24px').run();
      },
    },
    {
      title: 'Medium Text',
      description: 'Teks Sedang (20px)',
      icon: Type,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setFontSize('20px').run();
      },
    },

    // --- RESET / NORMAL (PENTING) ---
    {
      title: 'Normal Text',
      description: 'Kembali ke teks biasa',
      icon: Eraser,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .unsetFontSize() // Hapus ukuran
          .unsetColor() // Hapus warna
          .unsetBold() // Hapus bold
          .run();
      },
    },

    // --- WARNA (Contoh) ---
    {
      title: 'Red Text',
      description: 'Warna Merah',
      icon: Palette,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setColor('#ef4444').run();
      },
    },
  ];

  return items.filter((item) =>
    item.title.toLowerCase().startsWith(query.toLowerCase()),
  );
};
