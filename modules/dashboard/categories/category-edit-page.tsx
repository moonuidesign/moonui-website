'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryForm from '@/components/dashboard/category/category-form';
import { CategoryType } from '@/server-action/category/category-validator';

interface CategoryEntity {
  id: string;
  name: string;
  imageUrl?: string | null;
  parentId?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryEditPageProps {
  categoryType: CategoryType;
  id: string;
  availableParentCategories: CategoryEntity[];
  initialData: CategoryEntity | null;
}

const CategoryEditPage = ({
  categoryType,
  id,
  availableParentCategories,
  initialData,
}: CategoryEditPageProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success('Category updated successfully!');
    router.push(`/dashboard/category/${categoryType}`);
  };

  if (!initialData) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl capitalize">Edit {categoryType} Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Category not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent>
        <CategoryForm
          categoryType={categoryType}
          initialData={initialData}
          onSuccess={handleSuccess}
          availableParentCategories={availableParentCategories}
        />
      </CardContent>
    </Card>
  );
};

export default CategoryEditPage;
