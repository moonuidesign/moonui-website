import { Node, mergeAttributes } from '@tiptap/core';

export const InlineParagraph = Node.create({
  name: 'paragraph',
  priority: 1000, // Higher priority to override StarterKit paragraph if needed

  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { style: 'margin: 0;' }), 0];
  },
});
