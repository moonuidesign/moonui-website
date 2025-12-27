import { z } from 'zod';

const schema = z.any().refine(
    (val) => {
        if (!val) return false;
        // Handle string (HTML)
        if (typeof val === 'string') {
            const stripped = val.replace(/<[^>]*>/g, '').trim();
            return (
                stripped.length > 0 || (val.trim().length > 0 && val !== '<p></p>')
            );
        }
        // Handle object (TipTap JSON)
        if (typeof val === 'object' && val.content && val.content.length > 0) {
            return true;
        }
        return false;
    },
    'Deskripsi wajib diisi',
);

const testCases = [
    { name: 'Empty string', input: '', expected: false },
    { name: 'Empty paragraph', input: '<p></p>', expected: false },
    { name: 'Simple text', input: '<p>Hello</p>', expected: true },
    { name: 'Text with space', input: '<p>  Hello  </p>', expected: true },
    { name: 'Empty paragraph with space', input: '<p>   </p>', expected: false }, // Wait, stripped would be empty. check logic.
    { name: 'Image only', input: '<img src="foo" />', expected: true },
    { name: 'JSON object', input: { type: 'doc', content: [{ type: 'paragraph' }] }, expected: true },
    { name: 'Empty JSON object', input: { type: 'doc', content: [] }, expected: false },
];

console.log('Running Validator Tests...');
testCases.forEach(({ name, input, expected }) => {
    const result = schema.safeParse(input);
    const passed = result.success === expected;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}: Input='${JSON.stringify(input)}' Expected=${expected} Got=${result.success}`);
});
