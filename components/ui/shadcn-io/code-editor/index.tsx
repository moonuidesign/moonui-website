'use client';

import * as React from 'react';
import { useInView, type UseInViewOptions } from 'motion/react';
import { useTheme } from 'next-themes';
import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal } from 'lucide-react';

// --- COMPONENTS ---

type CopyButtonProps = {
  content: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  className?: string;
  onCopy?: (content: string) => void;
};

function CopyButton({
  content,
  size = 'default',
  variant = 'default',
  className,
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.(content);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleCopy}
      className={cn('h-8 w-8 p-0', className)}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export type CodeEditorProps = Omit<React.ComponentProps<'div'>, 'onCopy'> & {
  children: string;
  lang: string;
  themes?: {
    light: string;
    dark: string;
  };
  duration?: number;
  delay?: number;
  header?: boolean;
  dots?: boolean;
  icon?: React.ReactNode;
  cursor?: boolean;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  inViewOnce?: boolean;
  copyButton?: boolean;
  writing?: boolean;
  title?: string;
  onDone?: () => void;
  onCopy?: (content: string) => void;
};

function CodeEditor({
  children: code, // Code yang masuk adalah FULL string
  lang,
  themes = {
    light: 'github-light',
    dark: 'github-dark',
  },
  duration = 5,
  delay = 0,
  className,
  header = true,
  dots = true,
  icon,
  cursor = false,
  inView = false,
  inViewMargin = '0px',
  inViewOnce = true,
  copyButton = false,
  writing = true,
  title,
  onDone,
  onCopy,
  ...props
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = React.useRef<HTMLDivElement>(null);

  // State untuk animasi
  const [visibleCode, setVisibleCode] = React.useState('');
  const [fullHighlightedCode, setFullHighlightedCode] = React.useState('');
  const [isDone, setIsDone] = React.useState(false);

  // InView logic
  const inViewResult = useInView(editorRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  // 1. HIGHLIGHT FULL CODE ONCE (Fix Performance)
  React.useEffect(() => {
    const loadHighlightedCode = async () => {
      try {
        const { codeToHtml } = await import('shiki');
        const highlighted = await codeToHtml(code, {
          lang,
          themes: {
            light: themes.light,
            dark: themes.dark,
          },
          defaultColor: resolvedTheme === 'dark' ? 'dark' : 'light',
        });
        setFullHighlightedCode(highlighted);
      } catch (e) {
        console.error(`Language "${lang}" could not be loaded.`, e);
        // Fallback jika Shiki gagal: tampilkan plain text sebagai HTML yang aman
        setFullHighlightedCode(`<pre><code>${code}</code></pre>`);
      }
    };

    loadHighlightedCode();
  }, [code, lang, resolvedTheme, themes]);

  // 2. TYPING ANIMATION LOGIC
  React.useEffect(() => {
    // Reset state jika code berubah
    if (!writing) {
      setVisibleCode(code);
      setIsDone(true);
      onDone?.();
      return;
    }

    // Reset typing state ketika properti berubah
    setVisibleCode('');
    setIsDone(false);

    if (!code || !isInView) return;

    const characters = Array.from(code); // Handle emoji/unicode correctly
    let index = 0;
    const totalDurationMs = duration * 1000;
    const computedInterval = Math.max(totalDurationMs / characters.length, 4);

    let intervalId: NodeJS.Timeout;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (index < characters.length) {
          // Tambahkan karakter berikutnya
          const char = characters[index];
          setVisibleCode((prev) => prev + char);
          index++;

          // Auto scroll ke bawah
          if (editorRef.current) {
            editorRef.current.scrollTo({
              top: editorRef.current.scrollHeight,
              behavior: 'instant', // Instant lebih performant saat typing cepat
            });
          }
        } else {
          // Selesai
          clearInterval(intervalId);
          setIsDone(true);
          onDone?.();
        }
      }, computedInterval);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [code, duration, delay, isInView, writing, onDone]);

  return (
    <div
      className={cn(
        'relative bg-muted/50 w-[600px] h-[400px] border border-border overflow-hidden flex flex-col rounded-xl',
        className,
      )}
      {...props}
    >
      {/* HEADER SECTION (Optional) */}
      {header ? (
        <div className="bg-muted border-b border-border/75 dark:border-border/50 relative flex flex-row items-center justify-between gap-y-2 h-10 px-4 shrink-0">
          {dots && (
            <div className="flex flex-row gap-x-2">
              <div className="size-2 rounded-full bg-red-500/80"></div>
              <div className="size-2 rounded-full bg-yellow-500/80"></div>
              <div className="size-2 rounded-full bg-green-500/80"></div>
            </div>
          )}

          {title && (
            <div
              className={cn(
                'flex flex-row items-center gap-2',
                dots &&
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              )}
            >
              {icon ? (
                <div className="text-muted-foreground [&_svg]:size-3.5">
                  {typeof icon !== 'string' ? (
                    icon
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: icon }} />
                  )}
                </div>
              ) : (
                <Terminal size={13} className="text-muted-foreground" />
              )}
              <span className="truncate text-muted-foreground text-[13px] font-medium">
                {title}
              </span>
            </div>
          )}

          {copyButton && (
            <CopyButton
              content={code}
              size="sm"
              variant="ghost"
              className="-me-2 hover:bg-black/5 dark:hover:bg-white/10"
              onCopy={onCopy}
            />
          )}
        </div>
      ) : (
        copyButton && (
          <CopyButton
            content={code}
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 z-[2] bg-muted/50 hover:bg-muted"
            onCopy={onCopy}
          />
        )
      )}

      {/* EDITOR CONTENT */}
      <div
        ref={editorRef}
        className="flex-1 w-full text-sm  font-mono relative overflow-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
        {isDone && fullHighlightedCode ? (
          // STATE 1: SELESAI MENGETIK (Tampilkan HTML dari Shiki)
          <div dangerouslySetInnerHTML={{ __html: fullHighlightedCode }} />
        ) : (
          // STATE 2: SEDANG MENGETIK (Tampilkan Plain Text)
          <pre>
            {visibleCode}
            {cursor && !isDone && (
              <span className="inline-block w-[1ch] h-[1.2em] align-middle bg-foreground/50 animate-pulse ml-0.5" />
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

export { CodeEditor, CopyButton };
