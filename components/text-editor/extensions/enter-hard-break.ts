import { Extension } from '@tiptap/core';

export const EnterHardBreak = Extension.create({
    name: 'enterHardBreak',

    addKeyboardShortcuts() {
        return {
            Enter: () => this.editor.commands.setHardBreak(),
        };
    },
});
