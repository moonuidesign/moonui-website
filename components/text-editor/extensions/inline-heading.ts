import { Node, mergeAttributes } from '@tiptap/core';

// Helper to create inline heading node
const createInlineHeading = (level: number, name: string, fontSize?: string) =>
    Node.create({
        name,
        group: 'block', // Changed to block to be a sibling of P
        content: 'inline*', // Contains text

        parseHTML() {
            return [{
                tag: `h${level}`,
                getAttrs: (node) => {
                    // Basic check to see if it's our inline heading (avoid grabbing legitimate block H1 if mixed)
                    // But since we want to enforce H1, we grab all H1s that appear in inline contexts ideally.
                    // For now, accept generic tag match.
                    return null;
                }
            }];
        },

        renderHTML({ HTMLAttributes }) {
            return [
                `h${level}`,
                mergeAttributes(HTMLAttributes, {
                    style: `display: inline; font-size: ${fontSize || "inherit"}; margin: 0;`
                }),
                0
            ];
        },
    });

export const InlineH1 = createInlineHeading(1, 'inlineH1', '30px');
export const InlineH2 = createInlineHeading(2, 'inlineH2', '24px');
export const InlineH3 = createInlineHeading(3, 'inlineH3', '20px');
