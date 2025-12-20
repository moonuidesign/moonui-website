'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileCode2,
  FileJson,
  FileType,
  File,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/libs/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify'; // Asumsi kamu pakai react-toastify, sesuaikan jika pakai sonner
import { CodeEditor, CodeEditorProps } from '../code-editor';

export type CodeFile = {
  fileName: string;
  code: string;
  lang: string;
  icon?: React.ReactNode;
};

type CodeGroupProps = {
  files: CodeFile[];
  editorProps?: Partial<CodeEditorProps>;
  className?: string;
  maxHeight?: number; // Tinggi saat collapsed (default 400px)
};

const getIcon = (fileName: string) => {
  if (fileName.endsWith('.tsx') || fileName.endsWith('.ts'))
    return <FileCode2 className="size-4 mr-2 text-blue-400" />;
  if (fileName.endsWith('.vue'))
    return <FileCode2 className="size-4 mr-2 text-green-400" />;
  if (fileName.endsWith('.html'))
    return <FileType className="size-4 mr-2 text-orange-400" />;
  if (fileName.endsWith('.json'))
    return <FileJson className="size-4 mr-2 text-yellow-400" />;
  if (fileName.endsWith('.css'))
    return <FileType className="size-4 mr-2 text-blue-300" />;
  return <File className="size-4 mr-2 text-gray-400" />;
};

export function CodeGroup({
  files,
  editorProps,
  className,
  maxHeight = 400,
}: CodeGroupProps) {
  const [activeTab, setActiveTab] = React.useState(files[0]?.fileName);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  if (!files.length) return null;

  const activeFile = files.find((f) => f.fileName === activeTab) || files[0];

  const handleCopy = async () => {
    if (!activeFile?.code) return;
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      toast.success(`Copied ${activeFile.fileName} to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-muted/50 w-[600px] flex flex-col',
        className,
      )}
    >
      <Tabs
        defaultValue={files[0].fileName}
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col"
      >
        {/* --- HEADER TABS --- */}
        <div className="bg-muted border-b border-border/75 dark:border-border/50 flex flex-row items-center justify-between pr-2 overflow-hidden rounded-t-xl shrink-0 z-10">
          <div className="flex flex-row items-center overflow-x-auto no-scrollbar flex-1">
            {/* Mac Window Dots */}
            <div className="flex flex-row px-4 py-2 gap-1.5 shrink-0 sticky left-0 bg-muted z-10">
              <div className="size-2.5 rounded-full bg-red-500/80" />
              <div className="size-2.5 rounded-full bg-yellow-500/80" />
              <div className="size-2.5 rounded-full bg-green-500/80" />
            </div>

            <TabsList className="bg-transparent h-10 p-0 rounded-none w-auto justify-start">
              {files.map((file) => (
                <TabsTrigger
                  key={file.fileName}
                  value={file.fileName}
                  className={cn(
                    'relative h-10 rounded-none border-r border-transparent px-4 font-normal text-muted-foreground',
                    'data-[state=active]:bg-muted/50 data-[state=active]:text-foreground data-[state=active]:border-border/50',
                    'hover:bg-muted/30 transition-none',
                  )}
                >
                  {file.icon || getIcon(file.fileName)}
                  <span className="text-xs font-sans">{file.fileName}</span>
                  {activeTab === file.fileName && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500 layoutId='activeTabIndicator'" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* --- COPY BUTTON DI HEADER --- */}
          <div className="pl-2 bg-muted shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 w-7 p-0 hover:bg-black/5 dark:hover:bg-white/10"
              title="Copy content"
            >
              {copied ? (
                <Check className="size-3.5 text-green-500" />
              ) : (
                <Copy className="size-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* --- CONTENT AREA DENGAN ANIMASI EXPAND --- */}
        <motion.div
          layout
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : maxHeight,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full overflow-hidden bg-muted/50"
        >
          {files.map((file) => (
            <TabsContent
              key={file.fileName}
              value={file.fileName}
              className="mt-0 p-0 focus-visible:ring-0 h-full"
              forceMount={true} // Keep mounted for state preservation
              hidden={activeTab !== file.fileName}
            >
              <CodeEditor
                // Key penting untuk restart animasi typing saat tab ganti
                key={activeTab === file.fileName ? 'active' : 'inactive'}
                lang={file.lang}
                header={false}
                // Kita set h-full agar mengikuti tinggi container parent (motion.div)
                className="border-none rounded-none w-full h-full min-h-[300px]"
                inViewOnce={true}
                writing={activeTab === file.fileName}
                copyButton={false} // Matikan copy internal karena sudah ada di header
                {...editorProps}
              >
                {file.code}
              </CodeEditor>
            </TabsContent>
          ))}

          {/* Gradient Overlay saat Collapsed */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-muted to-transparent pointer-events-none z-10"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </Tabs>

      {/* --- SHOW MORE / LESS BUTTON --- */}
      <div className="border-t border-border/50 bg-muted/50 p-2 flex justify-center z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 text-xs text-muted-foreground gap-1 hover:bg-black/5 dark:hover:bg-white/10 w-full"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="size-3" /> Show Less
            </>
          ) : (
            <>
              <ChevronDown className="size-3" /> Show More
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
