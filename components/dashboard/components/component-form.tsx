'use client';

import { useState, useTransition, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  ClipboardPaste,
  Trash2,
  MousePointer2,
  ArrowDown,
  Sparkles,
  Eye,
  Expand,
  Shrink,
  Eraser,
  FileCode2,
  PlusCircle,
  Crown,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
  DialogDescription,
} from '@/components/ui/dialog';
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
import { RichTextEditor } from '@/components/ui/rich-text-editor';

// --- IMPORTS SERVER ACTION ---
import {
  ContentComponentFormValues,
  ContentComponentSchema,
  TIER_OPTIONS,
  STATUS_OPTIONS,
} from '@/server-action/createComponent/component-validator';
import { createContentComponent } from '@/server-action/createComponent/createComponent';
import { updateContentComponent } from '@/server-action/createComponent/updateComponent';
import { Category } from '@/server-action/getCategoryComponent';
import { AddCategoryCommand } from '@/components/Contentcomponents/addCategory';
import { IsolatedRenderer } from './isolated-renderer';
import { ZoomToolbar } from './zoom-toolbar';

// =====================================================================
// 1. TYPES & CONSTANTS
// =====================================================================

export interface ComponentEntity {
  id: string;
  title: string;
  typeContent: string;
  copyComponentTextHTML: string;
  copyComponentTextPlain: string;
  categoryComponentsId: string | null;
  urlBuyOneTime?: string | null;
  subCategoryComponentsId?: string | null;
  imageUrl: string | null;
  rawHTMLInput?: string | null;
  statusContent: 'draft' | 'published' | 'archived';
  tier: 'free' | 'pro' | null;
  slug: string[] | unknown;
  description?: any;
}

type ValidClipboardSource = 'figma' | 'framer' | null;

const CLIPBOARD_PATTERNS = {
  FIGMA:
    /data-metadata="(&lt;|<)!--\(figmeta\)|data-buffer="(&lt;|<)!--\(figma\)/i,
  FRAMER: /data-framer-pasteboard/i,
};

export default function ComponentForm({
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
  // Override if explicitly provided by subCategoryComponentsId (if DB supports it)
  if (component?.subCategoryComponentsId) {
    defaultChildId = component.subCategoryComponentsId;
  }

  const form = useForm<ContentComponentFormValues>({
    resolver: zodResolver(ContentComponentSchema),
    defaultValues: {
      title: component?.title ?? '',
      type: (component?.typeContent as 'figma' | 'framer') ?? 'figma',
      copyComponentTextHTML: component?.copyComponentTextHTML ?? '',
      copyComponentTextPlain: component?.copyComponentTextPlain ?? '',
      urlBuyOneTime: component?.urlBuyOneTime ?? '',
      categoryComponentsId: defaultParentId,
      subCategoryComponentsId: defaultChildId,

      rawHtmlInput: component?.rawHTMLInput ?? '',
      statusContent: component?.statusContent ?? 'draft',

      tier: component?.tier ?? 'free',
      slug: Array.isArray(component?.slug) ? (component?.slug as string[]) : [],
      description: component?.description ?? '',
    },
  });

  // Watchers
  const watchedHTML = useWatch({
    control: form.control,
    name: 'copyComponentTextHTML',
  });
  const watchedRawInput = useWatch({
    control: form.control,
    name: 'rawHtmlInput',
  });
  const watchedParentCategoryId = useWatch({
    control: form.control,
    name: 'categoryComponentsId',
  });

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
      const promise = async () => {
        const res = isEditMode
          ? await updateContentComponent(
              component!.id,
              values,
              selectedFile || undefined,
            )
          : await createContentComponent(values, selectedFile);

        if (!res?.success) {
          throw new Error(res?.error || 'Gagal menyimpan data.');
        }
        return res.message;
      };

      await toast
        .promise(promise(), {
          pending: isEditMode
            ? 'Updating component...'
            : 'Creating component...',
          success: {
            render({ data }) {
              return `${data}`;
            },
          },
          error: {
            render({ data }) {
              return (data as Error).message;
            },
          },
        })
        .then(() => {
          if (!isEditMode) {
            form.reset();
            setUploadedImagePreview(null);
            setSelectedFile(null);
          }
        })
        .catch(() => {});
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4 text-balance">
              {isEditMode ? 'Edit Component' : 'Create Component'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Import design (Figma/Framer), configure metadata, and generate AI
              code.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
              {/* SECTION 1: BASIC INFO */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Basic Information
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="space-y-8">
                  {/* Category & Sub Category */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="categoryComponentsId"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mb-3">
                            <FormLabel className="text-sm font-medium text-foreground">
                              Category
                            </FormLabel>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsDialogOpen(true)}
                              className="h-8 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/5"
                            >
                              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                              Add
                            </Button>
                          </div>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset sub category when parent changes
                              form.setValue('subCategoryComponentsId', '');
                            }}
                            value={field.value || ''}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[250px]">
                              {parentCategories.map((parent) => (
                                <SelectItem key={parent.id} value={parent.id}>
                                  {parent.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subCategoryComponentsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground mb-3 block">
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
                              <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue
                                  placeholder={
                                    !watchedParentCategoryId
                                      ? 'Select Parent First'
                                      : subCategories.length === 0
                                      ? 'No sub-categories'
                                      : 'Select Sub Category'
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[250px]">
                              {subCategories.map((child) => (
                                <SelectItem key={child.id} value={child.id}>
                                  {child.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Component Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Navbar Pro"
                            className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-8 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="statusContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Info className="w-3.5 h-3.5" /> Status
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem
                                  key={status}
                                  value={status}
                                  className="capitalize"
                                >
                                  {status}
                                </SelectItem>
                              ))}
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
                          <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Crown className="w-3.5 h-3.5" /> Tier
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || 'free'}
                          >
                            <FormControl>
                              <SelectTrigger className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIER_OPTIONS.map((tier) => (
                                <SelectItem
                                  key={tier}
                                  value={tier}
                                  className="capitalize"
                                >
                                  {tier}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 2: VISUAL REFERENCE */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MousePointer2 className="w-3.5 h-3.5" />
                    Visual Reference
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/20">
                  <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-background text-xs font-normal"
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
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={clearVisualData}
                          title="Clear Visual Data"
                        >
                          <Eraser className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-0">
                    <FormField
                      control={form.control}
                      name="copyComponentTextHTML"
                      render={() => (
                        <FormItem className="space-y-0">
                          <ContextMenu>
                            <ContextMenuTrigger>
                              {!watchedHTML ? (
                                <div
                                  className="h-[280px] flex flex-col items-center justify-center text-muted-foreground/60 border-2 border-dashed border-border/40 bg-background/50 m-6 rounded-lg cursor-pointer hover:bg-muted/30 hover:border-primary/30 transition-all group"
                                  onClick={handleStrictPaste}
                                >
                                  <div className="bg-muted p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <ClipboardPaste className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                  <p className="text-sm font-medium text-foreground">
                                    Click to Paste (Strict)
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Figma or Framer data only
                                  </p>
                                </div>
                              ) : (
                                <div className="h-[400px] w-full relative overflow-hidden bg-background">
                                  <IsolatedRenderer
                                    htmlCode={watchedHTML}
                                    scale={visualScale}
                                  />
                                </div>
                              )}
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-64">
                              <ContextMenuItem onSelect={handleStrictPaste}>
                                <ClipboardPaste className="mr-2 h-4 w-4" />{' '}
                                Paste (Strict Mode)
                              </ContextMenuItem>
                              {watchedHTML && (
                                <>
                                  <ContextMenuItem onSelect={copyPreviewToRaw}>
                                    <ArrowDown className="mr-2 h-4 w-4" /> Copy
                                    to Source Engine
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem
                                    onSelect={clearVisualData}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Clear
                                    Reference
                                  </ContextMenuItem>
                                </>
                              )}
                            </ContextMenuContent>
                          </ContextMenu>
                          <FormMessage className="px-6 pb-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 3: SOURCE ENGINE */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Source Engine
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="rounded-xl border border-border/60 overflow-hidden bg-muted/20">
                  <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/40">
                    <div className="flex bg-background p-1 rounded-lg border border-border/40">
                      <button
                        type="button"
                        onClick={() => setRawInputTab('code')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          rawInputTab === 'code'
                            ? 'bg-muted shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setRawInputTab('preview')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          rawInputTab === 'preview'
                            ? 'bg-muted shadow-sm text-primary'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        Review
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
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
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => form.setValue('rawHtmlInput', '')}
                          title="Clear Code"
                        >
                          <Eraser className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="relative bg-background group">
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
                                  className={`font-mono text-xs leading-relaxed resize-none border-0 focus-visible:ring-0 bg-background p-6 transition-all duration-300 ease-in-out ${
                                    isCodeExpanded ? 'h-[500px]' : 'h-[250px]'
                                  }`}
                                  spellCheck={false}
                                />
                              </FormControl>
                              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-xs px-3 shadow-sm border border-border/40"
                                  onClick={() =>
                                    setIsCodeExpanded(!isCodeExpanded)
                                  }
                                >
                                  {isCodeExpanded ? (
                                    <>
                                      <Shrink className="w-3 h-3 mr-1.5" /> Less
                                    </>
                                  ) : (
                                    <>
                                      <Expand className="w-3 h-3 mr-1.5" /> More
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 text-xs px-3 shadow-sm border border-border/40"
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
                                  <ClipboardPaste className="w-3 h-3 mr-1.5" />{' '}
                                  Paste
                                </Button>
                              </div>
                              {!field.value && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-40">
                                  <FileCode2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                  <span className="text-sm font-medium text-muted-foreground">
                                    Empty Source Code
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-[400px] w-full bg-slate-50 relative overflow-hidden flex items-center justify-center border-t border-dashed border-border/20">
                              {field.value ? (
                                <IsolatedRenderer
                                  htmlCode={field.value}
                                  scale={sourceScale}
                                />
                              ) : (
                                <div className="text-muted-foreground/50 text-xs flex flex-col items-center">
                                  <Eye className="mb-2 w-8 h-8" />
                                  <span>No code to render</span>
                                </div>
                              )}
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 4: DESC & TAGS */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Description & Metadata
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Description
                        </FormLabel>
                        <FormControl>
                          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 hover:border-border transition-colors">
                            <RichTextEditor
                              content={field.value}
                              onChange={(value) => field.onChange(value)}
                              placeholder="Add a description..."
                              className="min-h-[150px]"
                            />
                          </div>
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
                        <FormLabel className="text-sm font-medium text-foreground">
                          Tags / Keywords
                        </FormLabel>
                        <FormControl>
                          <TagInput
                            tags={field.value}
                            setTags={field.onChange}
                            placeholder="Add tags..."
                            className="bg-muted/30"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground/80 mt-3">
                          Press Enter to add tags
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urlBuyOneTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Purchase URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-14 bg-muted/30 border-border/60 hover:border-border transition-colors text-base"
                            placeholder="e.g. https://..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* SECTION 5: THUMBNAIL */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border/40" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Thumbnail
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <div
                    className="group relative cursor-pointer rounded-xl border-2 border-dashed border-border/60 bg-muted/20 p-8 text-center transition-all hover:border-primary/40 hover:bg-muted/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {activeImagePreview ? (
                      <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-sm">
                        <Image
                          src={activeImagePreview}
                          alt="Thumb"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-medium flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Change Image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-4">
                          <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-base font-medium text-foreground">
                          Upload Thumbnail
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PNG/JPG (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                  {activeImagePreview && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImagePreview(null);
                          setSelectedFile(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Image
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              <div className="pt-8">
                <Button
                  type="submit"
                  disabled={isPending}
                  size="lg"
                  className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 transition-all"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {isEditMode ? 'Updating...' : 'Processing...'}
                    </span>
                  ) : (
                    <span>
                      {isEditMode ? 'Update Component' : 'Save Component'}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Create a new parent or sub-category.
                </DialogDescription>
              </DialogHeader>
              <AddCategoryCommand
                parentCategories={localCategories.filter((c) => !c.parentId)}
                onCategoryCreated={(c) => {
                  setLocalCategories((p) => [...p, c]);

                  if (!c.parentId) {
                    form.setValue('categoryComponentsId', c.id, {
                      shouldValidate: true,
                    });
                  } else {
                    // If sub category created, and parent matches selected, auto select it
                    const currentParent = form.getValues(
                      'categoryComponentsId',
                    );
                    if (currentParent === c.parentId) {
                      form.setValue('subCategoryComponentsId', c.id, {
                        shouldValidate: true,
                      });
                    }
                  }

                  setIsDialogOpen(false);
                }}
                closeDialog={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
