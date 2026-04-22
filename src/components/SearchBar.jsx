import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ search, onSearch, placeholder = 'Search…', filters = [], count }) => (
  <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 w-full">
    {/* Search input */}
    <div className="relative flex-1 w-full min-w-[200px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <Search size={15} />
      </span>
      <input
        type="text"
        className="input-field pl-8 pr-8 py-2 text-sm h-9 w-full"
        placeholder={placeholder}
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
      {search && (
        <button
          onClick={() => onSearch('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
    </div>

    {/* Filter dropdowns */}
    {filters.map((f, i) => (
      <select
        key={i}
        value={f.value}
        onChange={e => f.onChange(e.target.value)}
        className="input-field py-2 text-sm h-9 w-full sm:w-auto shrink-0"
      >
        <option value="">{f.label}</option>
        {f.options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ))}

    {/* Count badge */}
    {count && (
      <div className="px-2 text-xs font-medium text-gray-500 whitespace-nowrap shrink-0">
        {count.filtered === count.total
          ? `${count.total} records`
          : `${count.filtered} / ${count.total}`}
      </div>
    )}
  </div>
);

export default SearchBar;
