import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Editor, Range, Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Text,
  Image as ImageIcon,
  Quote,
  Code,
  Eraser,
} from 'lucide-react';

interface CommandItemProps {
  title: string;
  description: string;
  icon: React.ElementType;
  command: (params: { editor: Editor; range: Range }) => void;
}

// Helper to execute commands with support for Inline vs Block behavior
const executeCommand = (
  editor: Editor,
  range: Range,
  blockFn: (chain: any) => any,
  inlineFn?: (chain: any) => any
) => {
  const $from = editor.state.doc.resolve(range.from);
  const isRoot = $from.parentOffset === 0;

  // 1. Delete the slash command trigger (e.g. "/")
  let chain = editor.chain().focus().deleteRange(range);

  if (isRoot) {
    // Case A: Start of a line -> Use Standard Block Command
    // Example: Converting a paragraph to a Heading 1 Block
    chain = blockFn(chain);
  } else {
    // Case B: Mid-line -> Context Dependent
    if (inlineFn) {
      // Use Inline Style if available (Simulate Heading mid-line)
      // This applies marks (styles) to the cursor so next text is styled.
      chain = inlineFn(chain);
    } else {
      // If no inline alternative (e.g. Lists), we MUST split the block.
      // HTML cannot have a list inside a paragraph.
      chain = chain.enter();
      chain = blockFn(chain);
    }
  }

  chain.run();
};

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Text / Normal',
      description: 'Reset formatting to plain text.',
      icon: Eraser,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        executeCommand(
          editor,
          range,
          (chain) => chain.setNode('paragraph'), // Block: Reset to P
          (chain) => chain.unsetMark('textStyle').unsetMark('bold').unsetMark('italic') // Inline: Clear marks
        );
      },
    },
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: Heading1,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        executeCommand(
          editor,
          range,
          (chain) => chain.setNode('heading', { level: 1 }), // Block H1
          // Inline H1 Simulation: Big Font + Bold
          (chain) => chain.setMark('textStyle', { fontSize: '2.25em' }).setMark('bold')
        );
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: Heading2,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        executeCommand(
          editor,
          range,
          (chain) => chain.setNode('heading', { level: 2 }), // Block H2
          // Inline H2 Simulation
          (chain) => chain.setMark('textStyle', { fontSize: '1.875em' }).setMark('bold')
        );
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: Heading3,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        executeCommand(
          editor,
          range,
          (chain) => chain.setNode('heading', { level: 3 }), // Block H3
          // Inline H3 Simulation
          (chain) => chain.setMark('textStyle', { fontSize: '1.5em' }).setMark('bold')
        );
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list.',
      icon: List,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        // Lists cannot be inline. Always split or toggle block.
        executeCommand(editor, range, (chain) => chain.toggleBulletList());
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: ListOrdered,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        executeCommand(editor, range, (chain) => chain.toggleOrderedList());
      },
    },
    {
      title: 'Blockquote',
      description: 'Capture a quote.',
      icon: Quote,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        executeCommand(editor, range, (chain) => chain.toggleBlockquote());
      },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet.',
      icon: Code,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        executeCommand(editor, range, (chain) => chain.toggleCodeBlock());
      },
    },
    {
      title: 'Image',
      description: 'Upload an image from your computer.',
      icon: ImageIcon,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        // Images are inline-block usually, but in standard TipTap they are blocks.
        // We'll treat them as "Split" for safety, or allow inline if extension supports it.
        // Standard Image extension is block-ish.
        const $from = editor.state.doc.resolve(range.from);
        const isRoot = $from.parentOffset === 0;
        
        editor.chain().focus().deleteRange(range).run();
        
        if (!isRoot) {
            editor.chain().focus().enter().run();
        }
        
        const url = window.prompt('Enter Image URL:');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
  ]
    .filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 10);
};

// 2. The Menu Component
export const CommandList = forwardRef((props: {
  items: CommandItemProps[];
  command: any;
}, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    },
    [props]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="z-50 min-w-[300px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
      <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
        {props.items.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground text-center">
            No results
          </div>
        ) : (
          props.items.map((item, index) => (
            <button
              key={index}
              className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none ${
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => selectItem(index)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-xs">{item.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {item.description}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
});

CommandList.displayName = 'CommandList';

// 3. Render function for Tippy
const renderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },
    onUpdate: (props: any) => {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup?.[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },
    onKeyDown: (props: any) => {
      if (props.event.key === 'Escape') {
        popup?.[0].hide();
        return true;
      }
      return component?.ref?.onKeyDown(props);
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};

// 4. Export the Extension
export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const slashCommandSuggestion = {
  items: getSuggestionItems,
  render: renderItems,
};