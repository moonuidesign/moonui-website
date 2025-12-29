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
  Crown,
  Info,
  Upload,
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
import DescriptionEditor from '@/components/text-editor/description-editor';

// --- IMPORTS SERVER ACTION ---
import {
  ContentComponentFormValues,
  ContentComponentSchema,
  TIER_OPTIONS,
  STATUS_OPTIONS,
} from '@/server-action/createComponent/component-validator';
import { createContentComponent } from '@/server-action/createComponent/createComponent';
import { updateContentComponent } from '@/server-action/createComponent/updateComponent';
import { createCategoryComponent } from '@/server-action/getCategoryComponent/create';
import { CategoryCombobox } from '@/components/dashboard/category-combobox';
import { IsolatedRenderer } from './isolated-renderer';
import { ZoomToolbar } from './zoom-toolbar';
import { useRouter } from 'next/navigation';

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
  FIGMA: /data-metadata="(&lt;|<)!--\(figmeta\)|data-buffer="(&lt;|<)!--\(figma\)/i,
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
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  // State Assets
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State UI Controls
  const [rawInputTab, setRawInputTab] = useState<'code' | 'preview'>('code');
  const [visualScale, setVisualScale] = useState(0.4);
  const [sourceScale, setSourceScale] = useState(0.5);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);

  const isEditMode = !!component;
  const router = useRouter();
  // --- HELPER: Parse Description ---
  const parseDescription = (desc: any) => {
    if (!desc) return undefined;
    if (typeof desc === 'object') return desc;
    if (typeof desc === 'string') {
      try {
        const parsed = JSON.parse(desc);
        if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
          return parsed;
        }
      } catch (e) {
        // Not JSON, assume HTML string
      }
      return desc;
    }
    return undefined;
  };

  // Setup Default Values
  let defaultParentId = '';
  let defaultChildId = '';

  if (component?.categoryComponentsId) {
    const selectedCat = categories.find((c) => c.id === component.categoryComponentsId);
    if (selectedCat) {
      if (selectedCat.parentId) {
        defaultParentId = selectedCat.parentId;
        defaultChildId = selectedCat.id;
      } else {
        defaultParentId = selectedCat.id;
      }
    }
  }
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
      description: parseDescription(component?.description),
      previewImage: component?.imageUrl || '',
    },
    mode: 'onChange', // Enable strict validation feedback
  });

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

  const activeImagePreview = uploadedImagePreview ? uploadedImagePreview : component?.imageUrl;

  const parentCategories = localCategories.filter((c) => !c.parentId);
  const subCategories = localCategories.filter((c) => c.parentId === watchedParentCategoryId);

  const createParentCategory = async (name: string) => {
    const res = await createCategoryComponent({ name, parentId: null });
    if ('error' in res) {
      toast.error(res.error);
      return null;
    }
    toast.success(res.success);
    setLocalCategories((prev) => [...prev, res.category]);
    return res.category;
  };

  const createSubCategory = async (name: string) => {
    const parentId = form.getValues('categoryComponentsId');
    if (!parentId) {
      toast.error('Please select a parent category first');
      return null;
    }
    const res = await createCategoryComponent({ name, parentId });
    if ('error' in res) {
      toast.error(res.error);
      return null;
    }
    toast.success(res.success);
    setLocalCategories((prev) => [...prev, res.category]);
    return res.category;
  };

  const validateClipboardSource = (htmlString: string): ValidClipboardSource => {
    if (!htmlString) return null;
    if (CLIPBOARD_PATTERNS.FIGMA.test(htmlString)) return 'figma';
    if (CLIPBOARD_PATTERNS.FRAMER.test(htmlString)) return 'framer';
    return null;
  };

  const handleStrictPaste = async () => {
    try {
      if (!navigator.clipboard) return toast.error('Clipboard API not available');

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
        const plainVal = textContent.trim() ? textContent : firstLine || 'Figma Content';

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
      if (!file.type.startsWith('image/')) return toast.error('Format harus gambar');
      if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
      if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
      setSelectedFile(file);
      form.setValue('previewImage', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: ContentComponentFormValues) => {
    if (!values.rawHtmlInput?.trim() && !isEditMode) {
      if (!confirm('⚠️ Source Engine (HTML) kosong. AI tidak akan berjalan. Lanjutkan?')) return;
    }

    startTransition(async () => {
      const promise = async () => {
        const res = isEditMode
          ? await updateContentComponent(component!.id, values, selectedFile || undefined)
          : await createContentComponent(values, selectedFile);

        if (!res?.success) {
          throw new Error(res?.error || 'Gagal menyimpan data.');
        }
        return res.message;
      };

      await toast
        .promise(promise(), {
          pending: isEditMode ? 'Updating component...' : 'Creating component...',
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
            router.push(`/dashboard/content/components`);
          }
          router.push(`/dashboard/content/components`);
        })
        .catch(() => {});
    });
  };

  return (
    <>
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-6 py-16">
          {/* Header Section */}
          <div className="mb-16">
            <h1 className="text-foreground mb-4 text-5xl font-bold tracking-tight text-balance">
              {isEditMode ? 'Edit Component' : 'Create New Component'}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Import design (Figma/Framer), configure metadata, and generate AI code.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
              {/* SECTION 1: BASIC INFO */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Basic Information
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div className="space-y-8">
                  {/* Category & Sub Category */}
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="categoryComponentsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground mb-3 block text-sm font-medium">
                            Category
                          </FormLabel>
                          <CategoryCombobox
                            categories={parentCategories}
                            value={field.value || ''}
                            onChange={(value) => {
                              field.onChange(value);
                              form.setValue('subCategoryComponentsId', '');
                            }}
                            onCreate={createParentCategory}
                            placeholder="Select Category"
                            searchPlaceholder="Search or create category..."
                            disabled={isPending}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subCategoryComponentsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground mb-3 block text-sm font-medium">
                            Sub Category
                          </FormLabel>
                          <CategoryCombobox
                            categories={subCategories}
                            value={field.value || ''}
                            onChange={field.onChange}
                            onCreate={createSubCategory}
                            placeholder={
                              !watchedParentCategoryId
                                ? 'Select Parent First'
                                : subCategories.length === 0
                                  ? 'No sub-categories'
                                  : 'Select Sub Category'
                            }
                            searchPlaceholder="Search or create sub category..."
                            disabled={!watchedParentCategoryId || isPending}
                          />
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
                        <FormLabel className="text-foreground text-sm font-medium">
                          Component Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Navbar Pro"
                            className="bg-muted/30 border-border/60 hover:border-border text-base transition-colors"
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
                          <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                            <Info className="h-3.5 w-3.5" /> Status
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status} className="capitalize">
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
                          <FormLabel className="text-foreground flex items-center gap-2 text-sm font-medium">
                            <Crown className="h-3.5 w-3.5" /> Tier
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || 'free'}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/30 border-border/60 hover:border-border transition-colors">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TIER_OPTIONS.map((tier) => (
                                <SelectItem key={tier} value={tier} className="capitalize">
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <MousePointer2 className="h-3.5 w-3.5" />
                    Visual Reference
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div className="border-border/60 bg-muted/20 overflow-hidden rounded-xl border">
                  <div className="bg-muted/30 border-border/40 flex items-center justify-between border-b p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-background text-xs font-normal">
                        Figma/Framer Only
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {watchedHTML && <ZoomToolbar scale={visualScale} setScale={setVisualScale} />}
                      {watchedHTML && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={clearVisualData}
                          title="Clear Visual Data"
                        >
                          <Eraser className="h-4 w-4" />
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
                                  className="text-muted-foreground/60 border-border/40 bg-background/50 hover:bg-muted/30 hover:border-primary/30 group m-6 flex h-[280px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all"
                                  onClick={handleStrictPaste}
                                >
                                  <div className="bg-muted mb-4 rounded-full p-4 transition-transform group-hover:scale-110">
                                    <ClipboardPaste className="text-muted-foreground h-6 w-6" />
                                  </div>
                                  <p className="text-foreground text-sm font-medium">
                                    Click to Paste (Strict)
                                  </p>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    Figma or Framer data only
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-background relative h-[400px] w-full overflow-hidden">
                                  <IsolatedRenderer htmlCode={watchedHTML} scale={visualScale} />
                                </div>
                              )}
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-64">
                              <ContextMenuItem onSelect={handleStrictPaste}>
                                <ClipboardPaste className="mr-2 h-4 w-4" /> Paste (Strict Mode)
                              </ContextMenuItem>
                              {watchedHTML && (
                                <>
                                  <ContextMenuItem onSelect={copyPreviewToRaw}>
                                    <ArrowDown className="mr-2 h-4 w-4" /> Copy to Source Engine
                                  </ContextMenuItem>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem
                                    onSelect={clearVisualData}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Clear Reference
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Source Engine
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div className="border-border/60 bg-muted/20 overflow-hidden rounded-xl border">
                  <div className="bg-muted/30 border-border/40 flex items-center justify-between border-b p-4">
                    <div className="bg-background border-border/40 flex rounded-lg border p-1">
                      <button
                        type="button"
                        onClick={() => setRawInputTab('code')}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                          rawInputTab === 'code'
                            ? 'bg-muted text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setRawInputTab('preview')}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                          rawInputTab === 'preview'
                            ? 'bg-muted text-primary shadow-sm'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        Review
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {rawInputTab === 'preview' && watchedRawInput && (
                        <ZoomToolbar scale={sourceScale} setScale={setSourceScale} />
                      )}
                      {watchedRawInput && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => form.setValue('rawHtmlInput', '')}
                          title="Clear Code"
                        >
                          <Eraser className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-background group relative">
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
                                  className={`bg-background resize-none border-0 p-6 font-mono text-xs leading-relaxed transition-all duration-300 ease-in-out focus-visible:ring-0 ${
                                    isCodeExpanded ? 'h-[500px]' : 'h-[250px]'
                                  }`}
                                  spellCheck={false}
                                />
                              </FormControl>
                              <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="border-border/40 h-7 border px-3 text-xs shadow-sm"
                                  onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                                >
                                  {isCodeExpanded ? (
                                    <>
                                      <Shrink className="mr-1.5 h-3 w-3" /> Less
                                    </>
                                  ) : (
                                    <>
                                      <Expand className="mr-1.5 h-3 w-3" /> More
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="border-border/40 h-7 border px-3 text-xs shadow-sm"
                                  onClick={async () => {
                                    const t = await navigator.clipboard.readText();
                                    if (t) {
                                      form.setValue('rawHtmlInput', t, {
                                        shouldValidate: true,
                                      });
                                      toast.success('Raw HTML Pasted');
                                    }
                                  }}
                                >
                                  <ClipboardPaste className="mr-1.5 h-3 w-3" /> Paste
                                </Button>
                              </div>
                              {!field.value && (
                                <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-40">
                                  <FileCode2 className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                                  <span className="text-muted-foreground text-sm font-medium">
                                    Empty Source Code
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="border-border/20 relative flex h-[400px] w-full items-center justify-center overflow-hidden border-t border-dashed bg-slate-50">
                              {field.value ? (
                                <IsolatedRenderer htmlCode={field.value} scale={sourceScale} />
                              ) : (
                                <div className="text-muted-foreground/50 flex flex-col items-center text-xs">
                                  <Eye className="mb-2 h-8 w-8" />
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
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                    Description & Metadata
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => {
                      console.log('[ComponentForm] Description Field Value:', field.value); // DEBUG
                      return (
                        <FormItem>
                          <FormLabel className="text-foreground text-sm font-medium">
                            Description
                          </FormLabel>
                          <FormControl>
                            <div className="border-border/60 bg-muted/30 hover:border-border rounded-lg border p-4 transition-colors">
                              <DescriptionEditor
                                initialContent={field.value}
                                onChange={(value) => field.onChange(value)}
                                outputHtml={true}
                                placeholder="Write a description for this component..."
                                minHeight="150px"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          {/* VISUAL DEBUGGER */}
                          {/* <div className="mt-2 p-2 bg-slate-950 text-slate-400 text-xs rounded border border-slate-800 font-mono overflow-auto max-h-40 whitespace-pre-wrap">
                            <p className="font-bold text-slate-200 mb-1">DEBUG: Description Value</p>
                            {String(field.value)}
                          </div> */}
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground text-sm font-medium">
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
                        <FormDescription className="text-muted-foreground/80 mt-3 text-xs">
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
                        <FormLabel className="text-foreground text-sm font-medium">
                          Purchase URL
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="bg-muted/30 border-border/60 hover:border-border text-base transition-colors"
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

              {/* SECTION 5: THUMBNAIL (UPDATED TO MATCH TEMPLATE-FORM STYLE) */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="bg-border/40 h-px flex-1" />
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Thumbnail
                  </h2>
                  <div className="bg-border/40 h-px flex-1" />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="previewImage"
                    render={() => (
                      <FormItem>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          onChange={handleImageUpload}
                        />
                        <label htmlFor="image-upload">
                          <FormControl>
                            <div
                              className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all ${
                                form.formState.errors.previewImage
                                  ? 'border-destructive/50 bg-destructive/5'
                                  : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center gap-4">
                                <div className="bg-primary/10 rounded-full p-4 transition-transform group-hover:scale-110">
                                  <Upload className="text-primary h-8 w-8" />
                                </div>
                                <div className="space-y-2">
                                  <p className="text-foreground text-base font-medium">
                                    Click to upload thumbnail
                                  </p>
                                  <p className="text-muted-foreground text-sm">
                                    PNG, JPG, WEBP up to 5MB
                                  </p>
                                </div>
                              </div>
                            </div>
                          </FormControl>
                        </label>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview Image */}
                  {activeImagePreview && (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="group border-border/60 bg-muted/30 relative aspect-video overflow-hidden rounded-lg border">
                        <div className="absolute top-2 left-2 z-10 rounded bg-green-500/80 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                          Thumbnail
                        </div>
                        <Image
                          src={activeImagePreview}
                          alt="Thumbnail Preview"
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault();
                            setUploadedImagePreview(null);
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <div className="pt-8">
                <Button
                  type="submit"
                  disabled={isPending}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 w-full text-base font-semibold transition-all"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                    <span>{isEditMode ? 'Update Component' : 'Save Component'}</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
