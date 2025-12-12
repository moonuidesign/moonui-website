'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { SlashCommand, slashCommandSuggestion } from './editor/slash-command';
import { FontSize } from './editor/font-size'; // Import custom FontSize extension
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  content?: any;
  onChange: (content: any) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Press "/" for commands...',
  className,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      TextStyle,
      Color,
      FontSize, // Register FontSize extension
      SlashCommand.configure({
        suggestion: slashCommandSuggestion,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[150px] p-4 max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    immediatelyRender: false, 
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!editor || !isMounted) {
    return (
      <div className={`border rounded-md border-input bg-background min-h-[150px] p-4 ${className}`}>
        Loading editor...
      </div>
    );
  }

  return (
    <div
      className={`border rounded-md border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${className}`}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
