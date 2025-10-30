// hooks/useItemSelection.ts (atau path yang sesuai)
'use client';

import { useSelectedItems } from '@/contexs/selectedItemsContexts';
import { useState, useEffect } from 'react';

// Gunakan generic type <T> untuk ID
export const useItemSelection = <T extends string | number>(
  items: { id: T }[],
) => {
  const { selectedItems, setSelectedItems } = useSelectedItems();
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  // Periksa status isAllSelected setiap kali item atau item terpilih berubah
  useEffect(() => {
    const allItemIds = items.map((item) => item.id);
    const isAllNowSelected =
      allItemIds.length > 0 &&
      allItemIds.every((id) => selectedItems.includes(id));
    if (isAllSelected !== isAllNowSelected) {
      setIsAllSelected(isAllNowSelected);
    }
  }, [isAllSelected, selectedItems, items]);

  // Handle perubahan checkbox individu
  const handleCheckboxChange = (id: T, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    }
  };

  // Handle perubahan checkbox "select all"
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsAllSelected(isChecked);
    if (isChecked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  return {
    selectedItems,
    isAllSelected,
    handleCheckboxChange,
    handleSelectAllChange,
  };
};
