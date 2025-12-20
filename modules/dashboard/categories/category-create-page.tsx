'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryForm from '@/components/dashboard/category/category-form';
import { CategoryType } from '@/server-action/category/category-validator';

interface CategoryCreatePageProps {
  categoryType: CategoryType;
  initialCategories: any[];
}

const CategoryCreatePage = ({
  categoryType,
  initialCategories,
}: CategoryCreatePageProps) => {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success('Category created successfully!');
    router.push(`/dashboard/content/${categoryType}/category`);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl capitalize">
          Create New {categoryType} Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryForm
          categoryType={categoryType}
          onSuccess={handleSuccess}
          availableParentCategories={initialCategories}
        />
      </CardContent>
    </Card>
  );
};

export default CategoryCreatePage;
