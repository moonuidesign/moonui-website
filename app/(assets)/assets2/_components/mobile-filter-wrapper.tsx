'use client';

import React, { useEffect, useState } from 'react';
import MobileFilterDrawer from '@/components/assets/mobile-filter-drawer';
import { useFilter, useFilterStore } from '@/contexts';
import { getAssetsData } from '@/server-action/getAssetsData';

export default function MobileFilterWrapper() {
    const {
        isFilterOpen,
        setFilterOpen,
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
        if (!isFilterOpen) return; // Lazy load if possible, or just load on mount

        const fetchCategories = async () => {
             try {
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
                console.error('Failed to fetch mobile categories:', error);
            }
        };

        fetchCategories();
    }, [isFilterOpen, tool, contentType]);

     const handleCategoryToggle = (slug: string) => {
        if (slug === 'all') {
            useFilterStore.getState().toggleCategory('all');
        } else {
            setCategory(slug);
        }
    };

    return (
        <MobileFilterDrawer
            isOpen={isFilterOpen}
            onClose={() => setFilterOpen(false)}
            gradientCategories={categories.gradientCategories[tool] || categories.gradientCategories.all || []}
            componentCategories={categories.componentCategories[tool] || categories.componentCategories.all || []}
            templateCategories={categories.templateCategories[tool] || categories.templateCategories.all || []}
            designCategories={categories.designCategories[tool] || categories.designCategories.all || []}
            onToggleCategory={handleCategoryToggle}
            onToggleSubCategory={toggleSubCategory}
        />
    );
}
