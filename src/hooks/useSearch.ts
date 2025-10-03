import { useState, useEffect, useMemo } from 'react';
import { Product } from './useProducts';

export const useSearch = (products: Product[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 2) {
      const filtered = searchResults.slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, searchResults]);

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    clearSearch
  };
};