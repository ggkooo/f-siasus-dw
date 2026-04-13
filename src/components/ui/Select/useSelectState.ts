import { useEffect, useRef, useState } from 'react';

export function useSelectState(searchable: boolean) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    if (searchable) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, searchable]);

  return {
    open,
    setOpen,
    query,
    setQuery,
    containerRef,
    inputRef,
  };
}
