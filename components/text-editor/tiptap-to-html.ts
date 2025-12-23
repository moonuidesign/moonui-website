import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlock from '@tiptap/extension-code-block';
import { FontSize } from './font-size';

// Extensions configuration matching the editor
const extensions = [
    StarterKit.configure({
        codeBlock: false,
    }),
    Underline,
    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-blue-500 underline cursor-pointer',
        },
    }),
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    FontSize,
    TaskList,
    TaskItem.configure({ nested: true }),
    CodeBlock.configure({
        HTMLAttributes: {
            class: 'bg-muted rounded-md p-4 font-mono text-sm',
        },
    }),
];

/**
 * Convert TipTap JSON content to HTML string
 * @param json - TipTap JSON content (can be object or string)
 * @returns HTML string or empty string if invalid
 */
export function tiptapToHtml(json: any): string {
    if (!json) return '';

    try {
        // If it's already a string (HTML or JSON string)
        if (typeof json === 'string') {
            // Check if it looks like HTML
            if (json.trim().startsWith('<')) {
                return json;
            }
            // Try to parse as JSON
            try {
                const parsed = JSON.parse(json);
                if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
                    return generateHTML(parsed, extensions);
                }
                return json;
            } catch {
                return json;
            }
        }

        // If it's a valid TipTap JSON object
        if (typeof json === 'object' && json.type === 'doc') {
            return generateHTML(json, extensions);
        }

        return '';
    } catch (error) {
        console.error('[tiptapToHtml] Error converting:', error);
        return '';
    }
}

/**
 * Check if content is valid TipTap JSON
 */
export function isTiptapJson(content: any): boolean {
    if (!content) return false;

    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            return parsed && typeof parsed === 'object' && parsed.type === 'doc';
        } catch {
            return false;
        }
    }

    return typeof content === 'object' && content.type === 'doc';
}

/**
 * Parse description - return both JSON and HTML
 */
export function parseDescriptionWithHtml(desc: any): { json: any; html: string } {
    if (!desc) return { json: undefined, html: '' };

    if (typeof desc === 'object' && desc.type === 'doc') {
        return { json: desc, html: tiptapToHtml(desc) };
    }

    if (typeof desc === 'string') {
        // Check if it's JSON
        try {
            const parsed = JSON.parse(desc);
            if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
                return { json: parsed, html: tiptapToHtml(parsed) };
            }
        } catch {
            // It's plain HTML or text
            return { json: undefined, html: desc };
        }
        return { json: undefined, html: desc };
    }

    return { json: undefined, html: '' };
}
