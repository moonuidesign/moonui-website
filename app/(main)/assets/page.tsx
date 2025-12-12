'use client';
import Content from '@/components/assets/content';
import NavbarFilter from '@/components/assets/navbar';
import SidebarFilter from '@/components/assets/sidebar';
import { getAssetsData } from '@/server-action/getAssetsData';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    allItems: any[];
    componentCategories: any[];
    templateCategories: any[];
    gradientCategories: any[];
    designCategories: any[];
  }>({
    allItems: [],
    componentCategories: [],
    templateCategories: [],
    gradientCategories: [],
    designCategories: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAssetsData();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F4F5] font-['Inter']">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 flex gap-8 relative">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-6">
            <div className="mb-6 pl-1">
              <h1 className="text-zinc-800 text-xl font-semibold font-['Plus_Jakarta_Sans']">
                Resources
              </h1>
            </div>
            <SidebarFilter
              gradientCategories={data.gradientCategories}
              componentCategories={data.componentCategories}
              templateCategories={data.templateCategories}
              designCategories={data.designCategories}
              items={data.allItems}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="w-full bg-neutral-100/50 rounded-3xl">
            <NavbarFilter />
            <div className="pb-20">
              {loading ? (
                <div className="flex h-64 w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
              ) : (
                <Content items={data.allItems} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
