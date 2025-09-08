'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ExternalLink, Hash, FileText, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { searchPages, SearchResult, highlightMatch } from '../utils/search';

interface SearchDropdownProps {
  query: string;
  onQueryChange: (query: string) => void;
  onNavigate: (href: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const getMatchTypeIcon = (matchType: SearchResult['matchType']) => {
  switch (matchType) {
    case 'name':
      return <FileText className="w-3 h-3" />;
    case 'description':
      return <Hash className="w-3 h-3" />;
    case 'keyword':
      return <Tag className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
  }
};

const getCategoryColor = (category: string) => {
  const colors = {
    'Overview': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Customers': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'User Management': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Payments': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Analytics': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'Reports': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'System': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    'Authentication': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };
  return colors[category as keyof typeof colors] || colors.System;
};

export default function SearchDropdown({ 
  query, 
  onQueryChange, 
  onNavigate, 
  isOpen, 
  onClose 
}: SearchDropdownProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      const searchResults = searchPages(query, 8);
      setResults(searchResults);
      setSelectedIndex(searchResults.length > 0 ? 0 : -1);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          onNavigate(results[selectedIndex].href);
          onClose();
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, results, selectedIndex, onNavigate, onClose]);

  // Attach keyboard listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultRefs.current[selectedIndex]) {
      resultRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleResultClick = (href: string) => {
    onNavigate(href);
    onClose();
  };

  if (!isOpen || !query.trim()) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-theme-card border border-theme rounded-lg shadow-lg ring-1 ring-border ring-opacity-20 z-50 max-h-96 overflow-hidden"
    >
      {/* Results */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center">
            <div className="inline-flex items-center space-x-2 text-theme-muted">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Searching...</span>
            </div>
          </div>
        )}

        {!isLoading && results.length === 0 && query.trim() && (
          <div className="p-4 text-center text-theme-muted">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No results found for "{query}"</p>
            <p className="text-xs mt-1">Try different keywords or check spelling</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="py-2">
            {results.map((result, index) => (
              <div
                key={`${result.href}-${index}`}
                ref={(el) => {resultRefs.current[index] = el}}
                className={clsx(
                  'px-4 py-3 cursor-pointer transition-colors border-l-2',
                  index === selectedIndex
                    ? 'bg-primary/10 border-primary'
                    : 'border-transparent hover:bg-secondary',
                )}
                onClick={() => handleResultClick(result.href)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-theme-muted">
                        {getMatchTypeIcon(result.matchType)}
                      </span>
                      <h3 
                        className="text-sm font-medium text-theme-foreground truncate"
                        dangerouslySetInnerHTML={{ 
                          __html: result.matchType === 'name' 
                            ? highlightMatch(result.name, query)
                            : result.name
                        }}
                      />
                      <span className={clsx(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getCategoryColor(result.category)
                      )}>
                        {result.category}
                      </span>
                    </div>
                    <p 
                      className="text-sm text-theme-muted line-clamp-2"
                      dangerouslySetInnerHTML={{ 
                        __html: result.matchType === 'description'
                          ? highlightMatch(result.description, query)
                          : result.description
                      }}
                    />
                    {result.matchType === 'keyword' && result.matchedTerm && (
                      <div className="flex items-center mt-1 space-x-1">
                        <Tag className="w-3 h-3 text-theme-muted" />
                        <span className="text-xs text-theme-muted">
                          Matched keyword: 
                          <span 
                            className="ml-1 font-medium"
                            dangerouslySetInnerHTML={{ 
                              __html: highlightMatch(result.matchedTerm, query)
                            }}
                          />
                        </span>
                      </div>
                    )}
                  </div>
                  <ExternalLink className="w-3 h-3 text-theme-muted flex-shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="px-4 py-2 border-t border-theme bg-secondary/30">
            <div className="flex items-center justify-between text-xs text-theme-muted">
              <span>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </span>
              <span>
                Use ↑↓ to navigate, Enter to select, Esc to close
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
