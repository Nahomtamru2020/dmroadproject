import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-sm">
      <input
        type="text"
        placeholder="Search reports and documents..."
        className="w-full px-4 py-2 bg-slate-800 text-white rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
