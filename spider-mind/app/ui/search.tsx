'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { FormEvent, useState } from 'react';
import Spinner from './loader';

interface SearchResult {
  description: string;
  title: string;
  url: string;
}

export default function Search({ placeholder }: { placeholder: string }) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('search');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search_query: searchQuery }),
      });

      if (!response.ok) {
        console.error('Error:', response.statusText);
        return;
      }

      const data = await response.json();
      console.log(data.search_results.content);
      setSearchResults(data.search_results.content);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-1 flex-shrink-0 flex-col">
      <form onSubmit={onSubmit} className="mb-4">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <input
          name="search"
          id="search"
          className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
          placeholder={placeholder}
        />
        <MagnifyingGlassIcon className="absolute left-3 h-[18px] w-[18px] -translate-y-7 text-gray-500 peer-focus:text-gray-900" />
      </form>
      {loading && <Spinner />} {/* Conditionally render loading icon */}
      {searchResults.length > 0 && !loading && (
        <div className="mt-4">
          <h2 className="text-lg font-medium">Search Results:</h2>
          <ul className="mt-2 space-y-2">
            {searchResults.map((result, index) => (
              <li key={index} className="border-b border-gray-200 pb-2">
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  <h3 className="text-md font-semibold">{result.title}</h3>
                  <p className="text-sm text-gray-600">{result.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
