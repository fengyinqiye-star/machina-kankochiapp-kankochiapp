'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AutocompletePrediction } from '@/types';

export default function SearchBar() {
  const { state, dispatch } = useApp();
  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAutocomplete = useCallback(async (input: string) => {
    if (input.trim().length === 0) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/places/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, language: 'ja', components: 'country:jp' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query: value });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAutocomplete(value);
      setShowSuggestions(true);
    }, 300);
  };

  const handleSelectPrediction = async (prediction: AutocompletePrediction) => {
    setShowSuggestions(false);
    dispatch({ type: 'SET_SEARCH_QUERY', query: prediction.description });

    try {
      const geocodeRes = await fetch('/api/places/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: prediction.placeId }),
      });

      if (!geocodeRes.ok) {
        throw new Error('Geocode failed');
      }

      const geocodeData = await geocodeRes.json();

      dispatch({
        type: 'SELECT_PLACE',
        place: {
          placeId: prediction.placeId,
          name: prediction.mainText,
          lat: geocodeData.lat,
          lng: geocodeData.lng,
          formattedAddress: geocodeData.formattedAddress || prediction.description,
        },
      });
    } catch {
      // Geocode failed - do not dispatch with 0,0 coordinates
    }
  };

  const handleClear = () => {
    dispatch({ type: 'SET_SEARCH_QUERY', query: '' });
    setPredictions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={state.searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowSuggestions(true)}
          placeholder="エリア名を入力（例: 東京、京都）"
          className="w-full pl-12 pr-12 py-4 text-lg bg-white rounded-xl shadow-lg border-2 border-transparent focus:border-primary focus:outline-none transition-colors"
          aria-label="エリア検索"
        />
        {state.searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="検索をクリア"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </button>
        )}
      </div>

      {showSuggestions && predictions.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {loading && (
            <li className="px-4 py-3 text-sm text-gray-500">検索中...</li>
          )}
          {predictions.map((p) => (
            <li key={p.placeId}>
              <button
                onClick={() => handleSelectPrediction(p)}
                className="w-full text-left px-4 py-3 hover:bg-ivory transition-colors"
              >
                <span className="font-medium text-gray-900">{p.mainText}</span>
                {p.secondaryText && (
                  <span className="text-sm text-gray-500 ml-1">
                    {p.secondaryText}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
