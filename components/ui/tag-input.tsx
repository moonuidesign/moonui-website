import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TagInputProps {
  placeholder?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  className?: string;
}

export function TagInput({ placeholder, tags, setTags, className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput)) {
      setTags([...tags, trimmedInput]);
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`flex flex-wrap gap-2 items-center border rounded-md p-2 bg-white ring-offset-white focus-within:ring-2 focus-within:ring-zinc-950 focus-within:ring-offset-2 ${className}`}>
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1 pr-1 text-xs">
          {tag}
          <span
            className="cursor-pointer hover:text-destructive"
            onClick={() => removeTag(index)}
          >
            <X className="w-3 h-3" />
          </span>
        </Badge>
      ))}
      <Input
        className="flex-1 border-none shadow-none focus-visible:ring-0 min-w-[120px] h-auto p-0 text-sm placeholder:text-zinc-500"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        onBlur={addTag}
      />
    </div>
  );
}
