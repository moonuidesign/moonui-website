'use client';

import { useTransition } from 'react';
import Image from 'next/image';

import { Check } from 'iconsax-reactjs';
import { UseCopyToClipboard } from '@/hooks/use-clipboard';
import { incrementcopycount } from '@/server-action/createComponent/updateCountCoppy';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { CopyIcon } from 'lucide-react';

// definisikan tipe props berdasarkan apa yang akan anda kirim dari server
export type ComponentCardProps = {
  id: string;
  title: string;
  typecontent: 'figma' | 'framer' | string;
  copycomponenthtml: string;
  imageurl?: string | null;
  copycount: number;
};

export function ComponentCard({
  id,
  title,
  typecontent,
  copycomponenthtml,
  imageurl,
  copycount,
}: ComponentCardProps) {
  const [ispending, starttransition] = useTransition();
  const { copy, copystatus } = UseCopyToClipboard();

  const handlecopy = () => {
    copy(copycomponenthtml, `komponen "${title}" berhasil disalin!`);

    // 2. panggil server action untuk menambah copycount (tanpa memblokir ui)
    starttransition(() => {
      incrementcopycount(id);
    });
  };

  const iscopied = copystatus === 'copied';

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
          {imageurl ? (
            <Image
              src={imageurl}
              alt={`preview untuk ${title}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm text-muted-foreground">
                tidak ada preview
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Badge variant={typecontent === 'figma' ? 'default' : 'secondary'}>
          {typecontent.charAt(0).toUpperCase() + typecontent.slice(1)}
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CopyIcon className="h-4 w-4" />
          <span>{copycount}</span>
        </div>
      </CardFooter>

      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <button
          onClick={handlecopy}
          disabled={ispending || iscopied}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {iscopied ? (
            <>
              <Check className="h-5 w-5" />
              <span>berhasil!</span>
            </>
          ) : (
            <>
              <CopyIcon className="h-5 w-5" />
              <span>salin komponen</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
