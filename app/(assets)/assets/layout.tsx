import React, { Suspense } from 'react';
import Assets2Navbar from '@/components/general/layout/assets2-navbar';
import MobileFilterWrapper from '../../../components/assets-v2/_components/mobile-filter-wrapper';
import type { Metadata } from 'next';

// Type label mapping for SEO
const TYPE_LABELS: Record<string, { singular: string; plural: string; description: string }> = {
  components: {
    singular: 'Component',
    plural: 'Components',
    description: 'Premium UI components for Figma and Framer',
  },
  templates: {
    singular: 'Template',
    plural: 'Templates',
    description: 'Ready-to-use templates for Figma and Framer',
  },
  designs: {
    singular: 'Design',
    plural: 'Designs',
    description: 'Beautiful design assets for your projects',
  },
  gradients: {
    singular: 'Gradient',
    plural: 'Gradients',
    description: 'Stunning gradient collections for modern UI',
  },
};

// Generate dynamic metadata based on query params
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string; q?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://moonui.design';

  const type = params?.type || '';
  const category = params?.category || '';
  const query = params?.q || '';

  // Helper to format category name from slug
  const formatCategory = (slug: string) =>
    decodeURIComponent(slug)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Generate title based on params
  let title = 'Browse All Assets — Design Library';
  let description =
    'Explore our complete collection of premium UI components, templates, gradients, and designs for Figma and Framer.';
  let canonicalUrl = `${baseUrl}/assets`;

  if (type && TYPE_LABELS[type]) {
    const typeInfo = TYPE_LABELS[type];

    if (category) {
      // Type + Category: e.g., "Hero Section Components"
      const formattedCategory = formatCategory(category);
      title = `${formattedCategory} ${typeInfo.plural} — Browse Collection`;
      description = `Discover ${formattedCategory.toLowerCase()} ${typeInfo.plural.toLowerCase()}. ${typeInfo.description}.`;
      canonicalUrl = `${baseUrl}/assets?type=${type}&category=${encodeURIComponent(category)}`;
    } else {
      // Type only: e.g., "Components — Browse All"
      title = `${typeInfo.plural} — Browse All ${typeInfo.plural}`;
      description = `Browse all ${typeInfo.plural.toLowerCase()} in our design library. ${typeInfo.description}.`;
      canonicalUrl = `${baseUrl}/assets?type=${type}`;
    }
  }

  if (query) {
    title = `Search: "${query}" — Assets`;
    description = `Search results for "${query}" in MoonUI Design assets library.`;
  }

  return {
    title,
    description,
    openGraph: {
      title: `${title} | MoonUI Design`,
      description,
      url: canonicalUrl,
      siteName: 'MoonUI Design',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function Assets2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full font-['Inter']">
      <Suspense fallback={null}>
        <MobileFilterWrapper />
      </Suspense>
      <div className="relative z-50 mx-auto flex w-full flex-col gap-6 rounded-t-[39px] px-0 py-6 pt-4 md:z-0 md:mt-[30px] md:rounded-none md:bg-none md:px-6 md:pt-0 lg:px-8">
        <div className="w-full px-4 md:px-0">
          <Assets2Navbar />
        </div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
