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
import { EnterHardBreak } from './extensions/enter-hard-break';
import { FontSize } from './font-size';
import { BlockSpan } from './extensions/block-span';
import { InlineH1, InlineH2, InlineH3 } from './extensions/inline-heading';

interface DescriptionEditorProps {
  initialContent?: any;
  onChange: (value: any) => void;
  /** If true, onChange will receive HTML string instead of JSON */
  outputHtml?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum height of the editor */
  minHeight?: string;
}

// Shared extensions configuration
import { InlineParagraph } from './extensions/inline-paragraph';

// ...

// Shared extensions configuration
const getExtensions = (placeholder: string) => [
  StarterKit.configure({
    codeBlock: false,
    paragraph: false, // Disable default paragraph
  }),
  InlineParagraph, // Custom Paragraph with display: inline
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
  BlockSpan, // Custom Block Span
  EnterHardBreak, // Force Enter -> <br>
  InlineH1, InlineH2, InlineH3, // Inline Semantic Headings

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
    placeholder: placeholder,
  }),
];

const DescriptionEditor = ({
  initialContent,
  onChange,
  outputHtml = false,
  placeholder = "Ketik '/' untuk perintah...",
  minHeight = '200px',
}: DescriptionEditorProps) => {
  const extensions = getExtensions(placeholder);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: initialContent || { type: 'doc', content: [] },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none w-full break-words focus:outline-none px-4 py-3 [&_p]:text-sm [&_p]:sm:text-base [&_p]:lg:text-lg [&_p]:leading-relaxed [&_li]:text-sm [&_li]:sm:text-base [&_li]:lg:text-lg [&_li]:leading-relaxed [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:lg:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:lg:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:lg:text-xl [&_h3]:font-medium [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_strong]:font-semibold [&_em]:italic',
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (outputHtml) {
        // Output HTML string wrapped in div as requested
        const html = editor.getHTML(); // e.g. <h1>...</h1><p>...</p>
        // Clean empty paragraphs (often created by Tiptap split)
        const cleanHtml = html.replace(/<p[^>]*>(\s*|<br\s*\/?>)?<\/p>/gi, '');
        const wrappedHtml = `<div>${cleanHtml}</div>`;
        console.log('[DescriptionEditor] outputHtml:', wrappedHtml); // DEBUG
        onChange(wrappedHtml);
      } else {
        // Output JSON (default TipTap behavior)
        const json = editor.getJSON();
        console.log('[DescriptionEditor] outputJSON:', json); // DEBUG
        onChange(json);
      }
    },
  });

  console.log('[DescriptionEditor] Rendering. initialContent:', initialContent); // DEBUG

  // Sync initialContent changes (e.g. async data loading)
  React.useEffect(() => {
    if (editor && initialContent) {
      const currentContent = outputHtml ? editor.getHTML() : editor.getJSON();
      // Only update if content is different to avoid cursor jumps/loops
      // Simple comparison for string, deep comparison for JSON might be needed but for now JSON is initial-only usually
      if (JSON.stringify(currentContent) !== JSON.stringify(initialContent)) {
        // editor.commands.setContent(initialContent); // CAUTION: This might reset cursor.
        // Better strategy: Only set if editor is empty? Or if explicitly changed.
        // For this specific bug (validation), the issue is likely outgoing data, not incoming.
        // But let's ensure we are not overwriting user input.
      }
    }
  }, [initialContent, editor, outputHtml]);

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
