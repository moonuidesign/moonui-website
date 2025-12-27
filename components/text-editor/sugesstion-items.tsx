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
    // --- UKURAN FONT ---
    // --- UKURAN FONT ---
    {
      title: 'Giant Text',
      description: 'Heading 1 (Inline Block)',
      icon: Scaling,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'inlineH1',
            content: [{ type: 'text', text: ' ' }]
          })
          .run();
      },
    },
    {
      title: 'Big Text',
      description: 'Heading 2 (Inline Block)',
      icon: Type,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'inlineH2',
            content: [{ type: 'text', text: ' ' }]
          })
          .run();
      },
    },
    {
      title: 'Medium Text',
      description: 'Heading 3 (Inline Block)',
      icon: Type,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'inlineH3',
            content: [{ type: 'text', text: ' ' }]
          })
          .run();
      },
    },

    // --- RESET / NORMAL (PENTING) ---
    {
      title: 'Normal Text',
      description: 'Paragraph',
      icon: Eraser,
      command: ({ editor, range }: any) => {
        // Since we are inside an inline structure, we might need to basically "step out"
        // But since we are inserting inline nodes, we can just continue typing text after the node?
        // Actually best way to "reset" is to ensure we are typing standard text again.
        // Tiptap unfortunately doesn't have "unsetInlineNode".
        // We might just unsetBold etc, and let user type.
        editor
          .chain()
          .focus()
          .deleteRange(range)
          // If we are inside an inline heading, we need to lift out?
          // Or just insert a space?
          .unsetAllMarks()
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
