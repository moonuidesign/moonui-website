'use client';

import React, { useMemo } from 'react';
import { renderAssetReleaseEmail } from '@/libs/email-renderer';

export default function NewsletterPreviewPage() {
  const html = useMemo(() => {
    const mockData = {
      assetName: 'Modern SaaS Dashboard',
      description:
        'A comprehensive dashboard template for SaaS applications. Features a clean layout, dark mode support, and responsive design.',
      imageUrl:
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
      demoUrl: 'https://moonui.design/assets/templates/1',
      assetType: 'templates',
      badgeText: 'New Release',
      relatedAssets: [
        {
          id: '2',
          title: 'E-commerce UI Kit',
          imageUrl:
            'https://images.unsplash.com/photo-1507238691140-d94cf8532421?q=80&w=1000&auto=format&fit=crop',
          tier: 'pro',
          type: 'components',
          author: 'MoonUI Team',
        },
        {
          id: '3',
          title: 'Landing Page Header',
          imageUrl:
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
          tier: 'free',
          type: 'components',
          author: 'John Doe',
        },
        {
          id: '4',
          title: '3D Abstract Shapes',
          imageUrl:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
          tier: 'pro_plus',
          type: 'assets',
          author: 'DesignMaster',
        },
      ],
    };

    return renderAssetReleaseEmail(mockData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Newsletter Preview</h1>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="mx-auto max-w-[800px] overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="border-b bg-gray-50 px-4 py-2 text-sm text-gray-500">
          Subject: New Release - Modern SaaS Dashboard
        </div>
        <iframe srcDoc={html} className="h-[800px] w-full border-0" title="Email Preview" />
      </div>
    </div>
  );
}
