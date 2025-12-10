'use client';

import { useState, useTransition, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Upload,
  X,
  ClipboardPaste,
  Trash2,
  MousePointer2,
  ArrowDown,
  Sparkles,
  Eye,
  ZoomIn,
  ZoomOut,
  Expand,
  Shrink,
  Eraser,
  FileCode2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { TagInput } from '@/components/ui/tag-input';

// --- IMPORTS SERVER ACTION ---
import {
  ContentComponentFormValues,
  ContentComponentSchema,
} from '@/server-action/createComponent/component-validator';
import { createContentComponent } from '@/server-action/createComponent/createComponent';
import { updateContentComponent } from '@/server-action/createComponent/updateComponent';
import { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from '@/components/Contentcomponents/addCategory';

// =====================================================================
// 1. TYPES & CONSTANTS
// =====================================================================

interface ComponentEntity {
  id: string;
  title: string;
  typeContent: string;
  copyComponentTextHTML: string;
  copyComponentTextPlain: string;
  categoryComponentsId: string | null;
  // Tambahkan field sub category jika ada di entity database Anda, jika tidak, logic di bawah tetap aman
  subCategoryComponentsId?: string | null;
  imageUrl: string | null;
  rawHTMLInput?: string | null;
  platform:
    | 'web'
    | 'ios'
    | 'android'
    | 'cross_platform'
    | 'all'
    | 'desktop'
    | null;
  statusContent: 'draft' | 'published' | 'archived';
  tier: 'free' | 'pro' | null;
  slug: unknown;
}

type ValidClipboardSource = 'figma' | 'framer' | null;

const CLIPBOARD_PATTERNS = {
  FIGMA:
    /data-metadata="(&lt;|<)!--\(figmeta\)|data-buffer="(&lt;|<)!--\(figma\)/i,
  FRAMER: /data-framer-pasteboard/i,
};

// =====================================================================
// 2. HELPER COMPONENTS
// =====================================================================

const ZoomToolbar = ({
  scale,
  setScale,
}: {
  scale: number;
  setScale: (s: number) => void;
}) => (
  <div className="flex items-center gap-1 bg-white rounded-md border border-zinc-200 p-0.5 shadow-sm">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => setScale(Math.max(0.1, scale - 0.1))}
    >
      <ZoomOut className="w-3 h-3" />
    </Button>
    <span className="text-[10px] font-mono w-8 text-center select-none">
      {(scale * 100).toFixed(0)}%
    </span>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => setScale(Math.min(2, scale + 0.1))}
    >
      <ZoomIn className="w-3 h-3" />
    </Button>
    <div className="w-[1px] h-3 bg-zinc-200 mx-1"></div>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-auto px-2 text-[10px]"
      onClick={() => setScale(0.4)}
    >
      Fit
    </Button>
  </div>
);

const IsolatedRenderer = ({
  htmlCode,
  scale = 1,
}: {
  htmlCode: string;
  scale?: number;
}) => {
  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; }
          #root { transform-origin: center center; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        </style>
      </head>
      <body>
        <div id="root" style="transform: scale(${scale})">
          ${htmlCode}
        </div>
      </body>
    </html>
  `;
  return (
    <iframe
      srcDoc={srcDoc}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

// =====================================================================
// 3. MAIN COMPONENT
// =====================================================================

export function ComponentForm({
  component,
  categories,
}: {
  component?: ComponentEntity | null;
  categories: Category[];
}) {
  const [isPending, startTransition] = useTransition();
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State Assets
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State UI Controls
  const [rawInputTab, setRawInputTab] = useState<'code' | 'preview'>('code');
  const [visualScale, setVisualScale] = useState(0.4);
  const [sourceScale, setSourceScale] = useState(0.5);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);

  const isEditMode = !!component;

  // Setup Default Values
  // Logic: Jika edit mode, kita perlu tahu mana parent mana child.
  // Asumsi: component.categoryComponentsId di DB menyimpan ID yang paling spesifik (bisa parent, bisa child).
  // Kita perlu mencari parent-nya jika ID tersebut adalah child.

  let defaultParentId = '';
  let defaultChildId = '';

  if (component?.categoryComponentsId) {
    const selectedCat = categories.find(
      (c) => c.id === component.categoryComponentsId,
    );
    if (selectedCat) {
      if (selectedCat.parentId) {
        // Jika yang tersimpan adalah child
        defaultParentId = selectedCat.parentId;
        defaultChildId = selectedCat.id;
      } else {
        // Jika yang tersimpan adalah parent
        defaultParentId = selectedCat.id;
      }
    }
  }

  const form = useForm<ContentComponentFormValues>({
    resolver: zodResolver(ContentComponentSchema),
    defaultValues: {
      title: component?.title ?? '',
      type: (component?.typeContent as 'figma' | 'framer') ?? 'figma',
      copyComponentTextHTML: component?.copyComponentTextHTML ?? '',
      copyComponentTextPlain: component?.copyComponentTextPlain ?? '',

      // Set Parent & Sub Category
      categoryComponentsId: defaultParentId,
      subCategoryComponentsId: defaultChildId,

      rawHtmlInput: component?.rawHTMLInput ?? '',
      statusContent: component?.statusContent ?? 'draft',
      platform: component?.platform ?? 'all',
      tier: component?.tier ?? 'free',
      slug: Array.isArray(component?.slug) ? (component?.slug as string[]) : [],
    },
  });

  // Watchers
  const watchedHTML = form.watch('copyComponentTextHTML');
  const watchedRawInput = form.watch('rawHtmlInput');
  const watchedParentCategoryId = form.watch('categoryComponentsId'); // Pantau perubahan Parent

  const activeImagePreview = uploadedImagePreview
    ? uploadedImagePreview
    : component?.imageUrl;

  // Filter Parent & Child Categories
  const parentCategories = localCategories.filter((c) => !c.parentId);
  const subCategories = localCategories.filter(
    (c) => c.parentId === watchedParentCategoryId,
  );

  // --- LOGIC: STRICT CLIPBOARD PROCESSOR ---
  const validateClipboardSource = (
    htmlString: string,
  ): ValidClipboardSource => {
    if (!htmlString) return null;
    if (CLIPBOARD_PATTERNS.FIGMA.test(htmlString)) return 'figma';
    if (CLIPBOARD_PATTERNS.FRAMER.test(htmlString)) return 'framer';
    return null;
  };

  const handleStrictPaste = async () => {
    try {
      if (!navigator.clipboard)
        return toast.error('Clipboard API not available');

      const clipboardItems = await navigator.clipboard.read();
      let htmlContent = '';
      let textContent = '';

      for (const item of clipboardItems) {
        if (item.types.includes('text/html'))
          htmlContent = await (await item.getType('text/html')).text();
        if (item.types.includes('text/plain'))
          textContent = await (await item.getType('text/plain')).text();
      }

      if (!htmlContent && !textContent) return toast.warn('Clipboard kosong');

      const source = validateClipboardSource(htmlContent);

      if (source === 'figma') {
        toast.success('✅ Figma Component Detected');
        const firstLine = textContent.split('\n')[0].trim();
        const plainVal = textContent.trim()
          ? textContent
          : firstLine || 'Figma Content';

        form.setValue('type', 'figma', { shouldValidate: true });
        form.setValue('copyComponentTextHTML', htmlContent, {
          shouldValidate: true,
        });
        form.setValue('copyComponentTextPlain', plainVal, {
          shouldValidate: true,
        });

        if (firstLine && !form.getValues('title')) {
          form.setValue('title', firstLine, { shouldValidate: true });
        }
      } else if (source === 'framer') {
        toast.success('✅ Framer Component Detected');
        form.setValue('type', 'framer', { shouldValidate: true });
        form.setValue('copyComponentTextHTML', htmlContent, {
          shouldValidate: true,
        });
        form.setValue('copyComponentTextPlain', 'Framer Component Data', {
          shouldValidate: true,
        });
      } else {
        toast.error('⛔ Format Ditolak! Hanya menerima Figma/Framer.', {
          autoClose: 4000,
        });
        toast.info("Gunakan kolom 'Source Engine' di bawah untuk HTML biasa.", {
          delay: 1000,
          autoClose: 5000,
        });
      }
    } catch (e) {
      toast.error('Gagal membaca clipboard. Izinkan akses di browser.');
    }
  };

  const clearVisualData = () => {
    form.setValue('copyComponentTextHTML', '', { shouldValidate: true });
    form.setValue('copyComponentTextPlain', '', { shouldValidate: true });
    toast.info('Visual Reference dibersihkan.');
  };

  const copyPreviewToRaw = () => {
    const val = form.getValues('copyComponentTextHTML');
    if (val) {
      form.setValue('rawHtmlInput', val, { shouldValidate: true });
      toast.success('Disalin ke Source Engine.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/'))
        return toast.error('Format harus gambar');
      if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) =>
        setUploadedImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: ContentComponentFormValues) => {
    if (!values.rawHtmlInput?.trim() && !isEditMode) {
      if (
        !confirm(
          '⚠️ Source Engine (HTML) kosong. AI tidak akan berjalan. Lanjutkan?',
        )
      )
        return;
    }

    startTransition(async () => {
      const res = isEditMode
        ? await updateContentComponent(
            component!.id,
            values,
            selectedFile || undefined,
          )
        : await createContentComponent(values, selectedFile);

      if (res?.success) {
        toast.success(res.message);
        if (!isEditMode) {
          form.reset();
          setUploadedImagePreview(null);
          setSelectedFile(null);
        }
      } else {
        toast.error(res?.error || 'Gagal menyimpan data.');
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                {isEditMode ? 'Edit Component' : 'Create Component'}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Import design (Figma/Framer), configure metadata, and generate
                AI code.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[140px]"
              >
                {isPending ? 'Processing...' : 'Save Component'}
              </Button>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
            {/* --- LEFT COLUMN --- */}
            <div className="space-y-8">
              {/* 1. VISUAL REFERENCE */}
              <Card className="shadow-sm border-zinc-200">
                <CardHeader className="py-3 px-4 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-semibold text-zinc-700">
                      Visual Reference
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-white text-zinc-500 border-zinc-200 shadow-sm"
                    >
                      Figma/Framer Only
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {watchedHTML && (
                      <ZoomToolbar
                        scale={visualScale}
                        setScale={setVisualScale}
                      />
                    )}
                    {watchedHTML && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                        onClick={clearVisualData}
                        title="Clear Visual Data"
                      >
                        <Eraser className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <div className="p-0 bg-zinc-100/30">
                  <FormField
                    control={form.control}
                    name="copyComponentTextHTML"
                    render={() => (
                      <FormItem>
                        <ContextMenu>
                          <ContextMenuTrigger>
                            {!watchedHTML ? (
                              <div
                                className="h-[280px] flex flex-col items-center justify-center text-zinc-400 border-dashed border-zinc-200 bg-white m-4 rounded-lg cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 transition-all group"
                                onClick={handleStrictPaste}
                              >
                                <div className="bg-zinc-50 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                  <ClipboardPaste className="w-6 h-6 text-zinc-400" />
                                </div>
                                <p className="text-sm font-medium text-zinc-600">
                                  Click to Paste (Strict)
                                </p>
                                <p className="text-xs text-zinc-400 mt-1">
                                  Figma or Framer data only
                                </p>
                              </div>
                            ) : (
                              <div className="h-[400px] w-full relative overflow-hidden bg-zinc-100">
                                <IsolatedRenderer
                                  htmlCode={watchedHTML}
                                  scale={visualScale}
                                />
                              </div>
                            )}
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-64">
                            <ContextMenuItem onSelect={handleStrictPaste}>
                              <ClipboardPaste className="mr-2 h-4 w-4" /> Paste
                              (Strict Mode)
                            </ContextMenuItem>
                            {watchedHTML && (
                              <>
                                <ContextMenuItem onSelect={copyPreviewToRaw}>
                                  <ArrowDown className="mr-2 h-4 w-4" /> Copy to
                                  Source Engine
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem
                                  onSelect={clearVisualData}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Clear
                                  Reference
                                </ContextMenuItem>
                              </>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                        <FormMessage className="px-4 pb-2" />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* 2. SOURCE ENGINE */}
              <Card className="shadow-sm border-indigo-100 ring-1 ring-indigo-50">
                <CardHeader className="py-2 px-4 bg-indigo-50/30 border-b border-indigo-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-indigo-100 rounded-md">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-zinc-800 block leading-tight">
                        Source Engine
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Input for AI Generation
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 p-0.5 rounded-md border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setRawInputTab('code')}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded transition-all ${
                          rawInputTab === 'code'
                            ? 'bg-white shadow-sm text-zinc-900'
                            : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setRawInputTab('preview')}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded transition-all ${
                          rawInputTab === 'preview'
                            ? 'bg-white shadow-sm text-indigo-600'
                            : 'text-zinc-500 hover:text-indigo-600'
                        }`}
                      >
                        Review
                      </button>
                    </div>
                    {rawInputTab === 'preview' && watchedRawInput && (
                      <ZoomToolbar
                        scale={sourceScale}
                        setScale={setSourceScale}
                      />
                    )}
                    {watchedRawInput && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-red-500"
                        onClick={() => form.setValue('rawHtmlInput', '')}
                        title="Clear Code"
                      >
                        <Eraser className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <div className="relative bg-white group">
                  <FormField
                    control={form.control}
                    name="rawHtmlInput"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        {rawInputTab === 'code' ? (
                          <>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Paste clean HTML here (<div class='...'>...</div>)"
                                className={`font-mono text-[11px] leading-relaxed resize-none border-0 focus-visible:ring-0 bg-white p-4 transition-all duration-300 ease-in-out ${
                                  isCodeExpanded ? 'h-[500px]' : 'h-[150px]'
                                }`}
                                spellCheck={false}
                              />
                            </FormControl>
                            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-6 text-[10px] px-2 shadow-sm border border-zinc-200 bg-white"
                                onClick={() =>
                                  setIsCodeExpanded(!isCodeExpanded)
                                }
                              >
                                {isCodeExpanded ? (
                                  <>
                                    <Shrink className="w-3 h-3 mr-1" /> Less
                                    Code
                                  </>
                                ) : (
                                  <>
                                    <Expand className="w-3 h-3 mr-1" /> More
                                    Code
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-6 text-[10px] px-2 shadow-sm border border-zinc-200 bg-white"
                                onClick={async () => {
                                  const t =
                                    await navigator.clipboard.readText();
                                  if (t) {
                                    form.setValue('rawHtmlInput', t, {
                                      shouldValidate: true,
                                    });
                                    toast.success('Raw HTML Pasted');
                                  }
                                }}
                              >
                                <ClipboardPaste className="w-3 h-3 mr-1" />{' '}
                                Paste
                              </Button>
                            </div>
                            {!field.value && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40">
                                <FileCode2 className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                <span className="text-xs font-medium text-zinc-400">
                                  Empty Source Code
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-[400px] w-full bg-slate-50 relative overflow-hidden flex items-center justify-center border-t border-dashed border-zinc-200">
                            {field.value ? (
                              <IsolatedRenderer
                                htmlCode={field.value}
                                scale={sourceScale}
                              />
                            ) : (
                              <div className="text-zinc-400 text-xs flex flex-col items-center">
                                <Eye className="mb-2 opacity-50 w-8 h-8" />
                                <span>No code to render</span>
                              </div>
                            )}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </div>

            {/* --- RIGHT COLUMN: METADATA --- */}
            <div className="space-y-6">
              {/* 1. CONFIGURATION */}
              <Card className="shadow-sm border-zinc-200">
                <CardHeader className="py-3 px-4 bg-zinc-50 border-b border-zinc-100">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">
                          Component Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-8 text-xs"
                            placeholder="e.g. Navbar Pro"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">
                          Tags / Keywords
                        </FormLabel>
                        <FormControl>
                          <TagInput
                            tags={field.value}
                            setTags={field.onChange}
                            placeholder="Add tags (press Enter)"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* KATEGORI UTAMA (PARENT) */}
                  <FormField
                    control={form.control}
                    name="categoryComponentsId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel className="text-xs font-semibold">
                            Category
                          </FormLabel>
                          <span
                            onClick={() => setIsDialogOpen(true)}
                            className="text-[10px] text-indigo-600 cursor-pointer font-medium hover:underline"
                          >
                            + New Category
                          </span>
                        </div>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset sub category saat parent berubah
                            form.setValue('subCategoryComponentsId', '');
                          }}
                          value={field.value || ''}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[250px]">
                            {parentCategories.map((parent) => (
                              <SelectItem
                                key={parent.id}
                                value={parent.id}
                                className="text-xs"
                              >
                                {parent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SUB KATEGORI (CHILD) - Hanya muncul jika parent dipilih */}
                  <FormField
                    control={form.control}
                    name="subCategoryComponentsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">
                          Sub Category
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                          disabled={
                            !watchedParentCategoryId ||
                            subCategories.length === 0 ||
                            isPending
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue
                                placeholder={
                                  !watchedParentCategoryId
                                    ? 'Select Category first'
                                    : subCategories.length === 0
                                    ? 'No sub-categories'
                                    : 'Select Sub Category (Optional)'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[250px]">
                            {subCategories.map((child) => (
                              <SelectItem
                                key={child.id}
                                value={child.id}
                                className="text-xs"
                              >
                                {child.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="statusContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">
                                Published
                              </SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold">
                            Tier
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || 'free'}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">
                          Platform Compatibility
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Platforms</SelectItem>
                            <SelectItem value="web">Web Only</SelectItem>
                            <SelectItem value="ios">iOS</SelectItem>
                            <SelectItem value="android">Android</SelectItem>
                            <SelectItem value="cross_platform">
                              Cross Platform
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 2. THUMBNAIL */}
              <Card className="shadow-sm border-zinc-200">
                <CardHeader className="py-3 px-4 bg-zinc-50 border-b border-zinc-100">
                  <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Thumbnail
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div
                    className={`relative border-2 border-dashed rounded-lg transition-colors min-h-[140px] flex items-center justify-center cursor-pointer ${
                      activeImagePreview
                        ? 'border-zinc-200 bg-white'
                        : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {activeImagePreview ? (
                      <div className="relative w-full h-full p-2 group">
                        <Image
                          src={activeImagePreview}
                          alt="Thumb"
                          width={300}
                          height={200}
                          className="w-full h-[160px] object-contain rounded-md"
                        />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7 shadow-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImagePreview(null);
                              setSelectedFile(null);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <div className="bg-white border border-zinc-200 p-2 rounded-full w-fit mx-auto mb-2 shadow-sm">
                          <Upload className="w-4 h-4 text-zinc-400" />
                        </div>
                        <span className="text-xs font-medium text-zinc-600">
                          Click to upload image
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-1">
                          PNG/JPG (Max 5MB)
                        </p>
                      </div>
                    )}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <AddCategoryCommand
            parentCategories={localCategories.filter((c) => !c.parentId)}
            onCategoryCreated={(c) => {
              setLocalCategories((p) => [...p, c]);

              if (!c.parentId) {
                form.setValue('categoryComponentsId', c.id, {
                  shouldValidate: true,
                });
              }

              setIsDialogOpen(false);
            }}
            closeDialog={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
