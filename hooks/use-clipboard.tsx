'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

type copystatus = 'idle' | 'copied';

export function UseCopyToClipboard() {
  const [copystatus, setcopystatus] = useState<copystatus>('idle');

  const copy = (text: string, successmessage = 'berhasil disalin!') => {
    navigator.clipboard
      .write([
        new ClipboardItem({
          'text/html': new Blob([text], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      .then(
        () => {
          toast.success(successmessage);
          setcopystatus('copied');
          setTimeout(() => setcopystatus('idle'), 1500); // reset setelah 1.5 detik
        },
        (err) => {
          toast.error('gagal menyalin ke clipboard.');
          console.error('clipboard api error:', err);
        },
      );
  };

  return { copy, copystatus };
}
