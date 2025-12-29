'use client';

import React, { useEffect, useState } from 'react';
import SidebarFilter from '@/components/assets/sidebar';
import { useFilter, useFilterStore } from '@/contexts';
import { getAssetsData } from '@/server-action/getAssetsData';
import { NavCategoryItem } from '@/types/category';

export default function SidebarWrapper() {
    const {
        tool,
        contentType,
        setCategory,
        toggleSubCategory,
    } = useFilter();

    const [categories, setCategories] = useState<{
        componentCategories: any;
        templateCategories: any;
        gradientCategories: any;
        designCategories: any;
    }>({
        componentCategories: { all: [], figma: [], framer: [] },
        templateCategories: { all: [], figma: [], framer: [] },
        gradientCategories: { all: [], figma: [], framer: [] },
        designCategories: { all: [], figma: [], framer: [] },
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // We only need categories here, so items fetch is not prioritized
                // But getAssetsData returns everything. Optimally we'd have getCategories logic separate.
                // Reusing getAssetsData for now as it structures categories nicely.
                const data = await getAssetsData({
                    contentType,
                    tool,
                    searchQuery: '',
                    groupedMode: false,
                });
                setCategories({
                    componentCategories: data.componentCategories,
                    templateCategories: data.templateCategories,
                    gradientCategories: data.gradientCategories,
                    designCategories: data.designCategories
                });
            } catch (error) {
                console.error('Failed to fetch sidebar categories:', error);
            }
        };

        fetchCategories();
    }, [tool, contentType]); // Re-fetch on tool/type change if strictly needed, though categories are static mostly

    // Single Select Logic
    const handleCategoryToggle = (slug: string) => {
        if (slug === 'all') {
            useFilterStore.getState().toggleCategory('all');
        } else {
            setCategory(slug);
        }
    };

    return (
        <SidebarFilter
            gradientCategories={categories.gradientCategories[tool] || categories.gradientCategories.all || []}
            componentCategories={categories.componentCategories[tool] || categories.componentCategories.all || []}
            templateCategories={categories.templateCategories[tool] || categories.templateCategories.all || []}
            designCategories={categories.designCategories[tool] || categories.designCategories.all || []}
            onToggleCategory={handleCategoryToggle}
            onToggleSubCategory={toggleSubCategory}
        />
    );
}
