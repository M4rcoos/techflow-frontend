import { useCallback, useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';

interface SearchFilterProps {
  placeholder?: string;
  minChars?: number;
  debounceMs?: number;
  onSearch: (value: string) => void;
}

export function SearchFilter({ 
  placeholder = 'Buscar...', 
  minChars = 3,
  debounceMs = 400,
  onSearch 
}: SearchFilterProps) {
  const [inputValue, setInputValue] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onSearch);
  
  callbackRef.current = onSearch;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current?.(value);
    }, debounceMs);
  }, [debounceMs]);

  const handleClear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setInputValue('');
    callbackRef.current?.('');
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showHint = inputValue.length > 0 && inputValue.length < minChars;

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        className="pl-10 pr-10"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {showHint && (
        <p className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
          Digite pelo menos {minChars} caracteres para buscar
        </p>
      )}
    </div>
  );
}
