import { Node, mergeAttributes } from '@tiptap/core';

export interface BlockSpanOptions {
    HTMLAttributes: Record<string, any>;
}

export const BlockSpan = Node.create<BlockSpanOptions>({
    name: 'blockSpan',

    group: 'block', // Allows simple sibling status with Paragraph

    content: 'inline*', // Contains text

    addAttributes() {
        return {
            fontSize: {
                default: null,
                parseHTML: (element) => element.style.fontSize,
                renderHTML: (attributes) => {
                    if (!attributes.fontSize) {
                        return {};
                    }
                    return {
                        style: `font-size: ${attributes.fontSize}`,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span',
                getAttrs: (node) => {
                    // Only parse spans that look like block-spans (e.g. they are direct children of root or distinct)
                    // Since parseHTML is fuzzy, we check for font-size style
                    if (node instanceof HTMLElement && node.style.fontSize) {
                        return null; // Accept
                    }
                    return false;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },
});
