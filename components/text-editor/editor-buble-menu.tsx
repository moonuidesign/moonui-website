'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Heading1,
  Heading2,
} from 'lucide-react';
import { cn } from '@/libs/utils';

// --- 1. DEFINISI KOMPONEN HELPER DI LUAR (Agar tidak kena ESLint Error) ---
interface MenuButtonProps {
  isActive?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const MenuButton = ({ isActive, onClick, children }: MenuButtonProps) => (
  <button
    type="button"
    // PENTING: Mencegah focus loss saat tombol ditekan
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={cn(
      'p-2 transition-colors flex items-center justify-center',
      'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800',
      isActive &&
        'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
    )}
  >
    {children}
  </button>
);

// --- 2. KOMPONEN UTAMA ---
interface EditorBubbleMenuProps {
  editor: Editor;
}

export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const tippyInstance = useRef<Instance | null>(null);

  // --- LOGIC MANUAL BUBBLE MENU ---
  useEffect(() => {
    if (!editor || !menuRef.current) return;

    // Inisialisasi Tippy
    tippyInstance.current = tippy(editor.options.element, {
      duration: 100,
      content: menuRef.current,
      interactive: true,
      trigger: 'manual',
      placement: 'top',
      hideOnClick: false,
      zIndex: 99,
      animation: 'scale',
      appendTo: () => document.body,
      arrow: false,
    });

    const updateMenu = () => {
      if (!tippyInstance.current) return;

      const { empty, from, to } = editor.state.selection;

      // Sembunyikan jika seleksi kosong
      if (empty || from === to) {
        tippyInstance.current.hide();
        return;
      }

      const domSelection = window.getSelection();
      if (domSelection && domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        tippyInstance.current.setProps({
          getReferenceClientRect: () => rect,
        });
        tippyInstance.current.show();
      }
    };

    editor.on('selectionUpdate', updateMenu);
    editor.on('blur', ({ event }) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event?.relatedTarget as Node)
      ) {
        tippyInstance.current?.hide();
      }
    });

    return () => {
      editor.off('selectionUpdate', updateMenu);
      editor.off('blur');
      tippyInstance.current?.destroy();
    };
  }, [editor]);

  // --- LOGIC LINK ---
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      ref={menuRef}
      className="flex w-fit items-center divide-x divide-neutral-200 rounded-md border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900 overflow-hidden"
    >
      {/* Group: Formatting Dasar */}
      <div className="flex">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <Bold className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <Italic className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
        >
          <Strikethrough className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
        >
          <Code className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Group: Headings */}
      <div className="flex">
        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>

        <MenuButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Group: Link */}
      <div className="flex">
        <MenuButton onClick={setLink} isActive={editor.isActive('link')}>
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
      </div>
    </div>
  );
};
