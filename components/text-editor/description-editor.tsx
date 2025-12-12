'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

// IMPORT FILE YANG KITA BUAT TADI
import { SlashCommand } from './slash-command';
import { EditorBubbleMenu } from './editor-buble-menu';
import { FontSize } from './font-size';

interface DescriptionEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
}

const DescriptionEditor = ({
  initialContent,
  onChange,
}: DescriptionEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      // --- Formatting Extensions ---
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Highlight.configure({ multicolor: true }),

      // --- Styling Extensions ---
      TextStyle,
      Color,
      FontSize, // Custom extension font size !important

      // --- Functional Extensions ---
      SlashCommand,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted rounded-md p-4 font-mono text-sm',
        },
      }),
      Placeholder.configure({
        placeholder: "Ketik '/' untuk perintah...",
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full rounded-md border border-input bg-transparent shadow-sm relative">
      {/* MENU MELAYANG (Bubble Menu) */}
      <EditorBubbleMenu editor={editor} />

      {/* EDITOR UTAMA */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default DescriptionEditor;
