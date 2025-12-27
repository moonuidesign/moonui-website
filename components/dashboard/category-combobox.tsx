'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Category } from '@/server-action/getCategoryComponent';

interface CategoryComboboxProps {
  categories: Category[];
  value?: string;
  onChange: (value: string) => void;
  onCreate: (name: string) => Promise<Category | null>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  width?: string;
}

export function CategoryCombobox({
  categories,
  value,
  onChange,
  onCreate,
  placeholder = 'Select Category',
  searchPlaceholder = 'Search category...',
  emptyText = 'No category found.',
  disabled = false,
  width = 'w-full',
}: CategoryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedCategory = categories.find((c) => c.id === value);

  const handleCreate = async () => {
    if (!inputValue.trim()) return;

    setIsCreating(true);
    try {
      const newCategory = await onCreate(inputValue);
      if (newCategory) {
        onChange(newCategory.id);
        setOpen(false);
        setInputValue('');
      }
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Check if the exact input value already exists (case insensitive)
  const exactMatch = categories.some(
    (c) => c.name.toLowerCase() === inputValue.toLowerCase(),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between bg-muted/30 border-border/60 hover:border-border transition-colors text-base font-normal',
            width,
            !value && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('p-0', width)} align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2 text-sm text-center">
                <p className="mb-2 text-muted-foreground">{emptyText}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full h-8"
                  onClick={handleCreate}
                  disabled={isCreating || !inputValue.trim()}
                >
                  {isCreating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      Create "{inputValue}"
                    </span>
                  )}
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer h-10"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === category.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Show "Create" option even if there are matches, but not exact match */}
            {inputValue && !exactMatch && categories.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    className="cursor-pointer font-medium text-primary"
                    value={`create-${inputValue}`} // Unique value to avoid filtering issues
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{inputValue}"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
