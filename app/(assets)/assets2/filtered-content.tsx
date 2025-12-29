'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useFilter } from '@/contexts';
import { Assets2Card } from '@/components/assets/assets2-card';
import { UseCopyToClipboard } from '@/hooks/use-clipboard';
import { toast } from 'react-toastify';
import { getFingerprint } from '@thumbmarkjs/thumbmarkjs';
import { checkDownloadLimit } from '@/server-action/limit';
import { incrementAssetStats } from '@/server-action/incrementAssetStats';

import { Loader2 } from 'lucide-react';
import { getInfiniteData } from '@/server-action/getAssets2Data';

interface ContentProps {
    initialItems?: any[];
    initialTotalCount?: number;
    sortBy?: 'recent' | 'popular';
}

export default function FilteredContent({
    initialItems = [],
    initialTotalCount = 0,
    sortBy = 'recent',
}: ContentProps) {
    const {
        tool,
        contentType,
        categorySlugs,
        selectedTiers,
        searchQuery,
    } = useFilter();

    const router = useRouter();
    const { copy } = UseCopyToClipboard();

    // --- STATE ---
    const [fetchedItems, setFetchedItems] = useState<any[]>(initialItems);
    const [totalCount, setTotalCount] = useState(initialTotalCount);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // State untuk menyimpan Fingerprint ID
    const [fingerprint, setFingerprint] = useState<string>('');

    // Intersection Observer
    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Limits
    const initialLimit = 12;
    const loadMoreLimit = 6;

    // --- THUMBMARK INIT ---
    useEffect(() => {
        const initFingerprint = async () => {
            try {
                const fp = await getFingerprint();
                setFingerprint(fp);
            } catch (error) {
                console.error('Failed to generate fingerprint:', error);
            }
        };
        initFingerprint();
    }, []);

    // Reset when filters change
    useEffect(() => {
        setFetchedItems(initialItems);
        setTotalCount(initialTotalCount);
        setPage(1);
        setHasMore(initialItems.length < initialTotalCount);
    }, [initialItems, initialTotalCount, categorySlugs, tool, contentType, selectedTiers, searchQuery, sortBy]);

    // --- ACTIONS ---

    const handleCopy = async (text: string, id: string, type: string) => {
        if (!text) return toast.error('No content to copy');
        const limitCheck = await checkDownloadLimit('copy', id, type, fingerprint);
        if (!limitCheck.success) {
            if (limitCheck.requiresLogin) {
                toast.info(limitCheck.message || 'Please login to continue');
                return router.push('/signin');
            }
            if (limitCheck.requiresUpgrade) {
                toast.warning(limitCheck.message || 'Please upgrade to continue');
                return router.push('/pricing');
            }
            return toast.error(limitCheck.message || 'Limit reached');
        }
        incrementAssetStats(id, type, 'copy');
        copy(text, 'Component copied to clipboard!');
    };

    const handleDownload = async (url: string, id: string, type: string) => {
        if (!url) return toast.error('Download link not available');
        const limitCheck = await checkDownloadLimit('download', id, type, fingerprint);
        if (!limitCheck.success) {
            if (limitCheck.requiresLogin) {
                toast.info(limitCheck.message || 'Please login to continue');
                return router.push('/signin');
            }
            if (limitCheck.requiresUpgrade) {
                toast.warning(limitCheck.message || 'Please upgrade to continue');
                return router.push('/pricing');
            }
            return toast.error(limitCheck.message || 'Limit reached');
        }
        incrementAssetStats(id, type, 'download');
        window.open(url, '_blank');
    };

    const fetchMoreItems = useCallback(
        async (currentPage: number) => {
            if (currentPage === 1) return;

            try {
                setLoading(true);
                const categorySlug = categorySlugs.length > 0 ? categorySlugs[0] : 'all';

                const limit = loadMoreLimit;
                const offset = initialLimit + (currentPage - 2) * loadMoreLimit;

                const res = await getInfiniteData(
                    categorySlug,
                    limit,
                    offset,
                    contentType,
                    selectedTiers,
                    tool,
                    sortBy,
                    searchQuery
                );

                if (res.items.length < limit) {
                    setHasMore(false);
                }

                setFetchedItems(prev => [...prev, ...res.items]);
                setTotalCount(res.totalCount);
            } catch (error) {
                console.error('Error fetching items:', error);
                toast.error('Failed to load more items');
            } finally {
                setLoading(false);
            }
        },
        [
            tool,
            contentType,
            categorySlugs,
            selectedTiers,
            sortBy,
            initialLimit,
            loadMoreLimit,
            searchQuery
        ],
    );

    useEffect(() => {
        if (page > 1) {
            fetchMoreItems(page);
        }
    }, [page, fetchMoreItems]);


    if (!loading && fetchedItems.length === 0 && page === 1) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center text-zinc-400">
                <p className="text-lg font-medium">No {contentType || 'items'} found</p>
                <button onClick={() => window.location.reload()} className="text-orange-600 hover:underline mt-4 text-sm">Clear all filters</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full min-h-[500px]">
            <section className="flex flex-col gap-4">
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <h2 className="text-sm font-medium text-gray-500">{totalCount} Results</h2>
                </div>

                <div className="grid grid-cols-1 px-8 md:px-0 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {fetchedItems.map((item, index) => {
                            let rawUrl = item.imageUrl || item.url || '';
                            if (rawUrl && typeof rawUrl === 'object' && rawUrl.url) {
                                rawUrl = rawUrl.url;
                            }
                            let finalUrl = '/placeholder-image.png';
                            if (typeof rawUrl === 'string' && rawUrl.length > 0) {
                                if (rawUrl.startsWith('http') || rawUrl.startsWith('https')) {
                                    finalUrl = rawUrl;
                                } else {
                                    const domain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
                                    finalUrl = `https://${domain}/${rawUrl}`;
                                }
                            }

                            if (fetchedItems.length === index + 1) {
                                return (
                                    <div ref={lastElementRef} key={`${item.id}-${index}`}>
                                        <Assets2Card
                                            id={item.id}
                                            title={item.title}
                                            imageUrl={finalUrl}
                                            tier={item.tier}
                                            createdAt={item.createdAt}
                                            author={item.author}
                                            type={item.type}
                                            onCopy={item.type === 'components' ? () => handleCopy(item.copyData, item.id, item.type) : undefined}
                                            onDownload={item.type !== 'components' ? () => handleDownload(item.downloadUrl, item.id, item.type) : undefined}
                                        />
                                    </div>
                                );
                            }

                            return (
                                <Assets2Card
                                    key={`${item.id}-${index}`}
                                    id={item.id}
                                    title={item.title}
                                    imageUrl={finalUrl}
                                    tier={item.tier}
                                    createdAt={item.createdAt}
                                    author={item.author}
                                    type={item.type}
                                    onCopy={item.type === 'components' ? () => handleCopy(item.copyData, item.id, item.type) : undefined}
                                    onDownload={item.type !== 'components' ? () => handleDownload(item.downloadUrl, item.id, item.type) : undefined}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>

                {loading && (
                    <div className="w-full flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                )}
            </section>
        </div>
    );
}
