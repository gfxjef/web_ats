import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, Clock, TrendingUp, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'history' | 'suggestion' | 'trending';
  count?: number;
  category?: string;
}

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  history?: string[];
  trending?: string[];
  isLoading?: boolean;
  isDebouncing?: boolean;
  showSuggestions?: boolean;
  showHistory?: boolean;
  showTrending?: boolean;
  disabled?: boolean;
  error?: string;
  searchTime?: number;
  resultCount?: number;
  onClearHistory?: () => void;
  onRemoveFromHistory?: (item: string) => void;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({
    value = "",
    onChange,
    onSearch,
    placeholder = "Buscar productos...",
    suggestions = [],
    history = [],
    trending = [],
    isLoading = false,
    isDebouncing = false,
    showSuggestions = true,
    showHistory = true,
    showTrending = true,
    disabled = false,
    error,
    searchTime,
    resultCount,
    onClearHistory,
    onRemoveFromHistory,
    className,
    inputClassName,
    dropdownClassName,
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Combinar refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Calcular si mostrar dropdown
    const showDropdown = isFocused && (
      (showHistory && history.length > 0 && !value.trim()) ||
      (showTrending && trending.length > 0 && !value.trim()) ||
      (showSuggestions && suggestions.length > 0 && value.trim()) ||
      value.trim().length > 0
    );

    // Crear lista combinada de sugerencias
    const combinedSuggestions: SearchSuggestion[] = React.useMemo(() => {
      const items: SearchSuggestion[] = [];

      // Agregar historial si no hay búsqueda activa
      if (showHistory && history.length > 0 && !value.trim()) {
        items.push(
          ...history.slice(0, 5).map((item, index) => ({
            id: `history-${index}`,
            text: item,
            type: 'history' as const
          }))
        );
      }

      // Agregar trending si no hay búsqueda activa
      if (showTrending && trending.length > 0 && !value.trim()) {
        items.push(
          ...trending.slice(0, 3).map((item, index) => ({
            id: `trending-${index}`,
            text: item,
            type: 'trending' as const
          }))
        );
      }

      // Agregar sugerencias si hay búsqueda activa
      if (showSuggestions && value.trim()) {
        items.push(...suggestions.slice(0, 8));
      }

      return items;
    }, [history, trending, suggestions, value, showHistory, showTrending, showSuggestions]);

    // Manejar cambio de input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange?.(newValue);
      setSelectedIndex(-1);
    };

    // Manejar selección de sugerencia
    const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
      onChange?.(suggestion.text);
      onSearch?.(suggestion.text);
      setIsFocused(false);
      setSelectedIndex(-1);
    };

    // Manejar teclas
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < combinedSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && combinedSuggestions[selectedIndex]) {
            handleSuggestionSelect(combinedSuggestions[selectedIndex]);
          } else if (value.trim()) {
            onSearch?.(value.trim());
            setIsFocused(false);
          }
          break;
        case 'Escape':
          setIsFocused(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    // Manejar clic fuera
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsFocused(false);
          setSelectedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Limpiar input
    const handleClear = () => {
      onChange?.("");
      inputRef.current?.focus();
    };

    return (
      <div className={cn("relative w-full", className)} ref={dropdownRef}>
        {/* Input principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pl-10 pr-12",
              error && "border-red-500 focus:border-red-500",
              inputClassName
            )}
          />

          {/* Indicadores de estado en el input */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {isDebouncing && (
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            )}
            {isLoading && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
            {value && !isLoading && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 p-0 hover:bg-gray-100"
                onClick={handleClear}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Información de búsqueda */}
        {(searchTime !== undefined || resultCount !== undefined || error) && (
          <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                <>
                  {resultCount !== undefined && (
                    <span>{resultCount} resultado{resultCount !== 1 ? 's' : ''}</span>
                  )}
                  {searchTime !== undefined && (
                    <span>en {searchTime.toFixed(0)}ms</span>
                  )}
                </>
              )}
            </div>
            {isDebouncing && (
              <span className="text-yellow-600">Escribiendo...</span>
            )}
          </div>
        )}

        {/* Dropdown de sugerencias */}
        {showDropdown && (
          <div 
            className={cn(
              "absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto",
              dropdownClassName
            )}
          >
            {combinedSuggestions.length > 0 ? (
              <div className="py-2">
                {/* Sección de historial */}
                {showHistory && history.length > 0 && !value.trim() && (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Búsquedas recientes</span>
                      </div>
                      {onClearHistory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onClearHistory}
                          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Limpiar
                        </Button>
                      )}
                    </div>
                    {history.slice(0, 5).map((item, index) => (
                      <div
                        key={`history-${index}`}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50",
                          selectedIndex === index && "bg-gray-100"
                        )}
                        onClick={() => handleSuggestionSelect({
                          id: `history-${index}`,
                          text: item,
                          type: 'history'
                        })}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{item}</span>
                        </div>
                        {onRemoveFromHistory && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-5 h-5 p-0 hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveFromHistory(item);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Sección de trending */}
                {showTrending && trending.length > 0 && !value.trim() && (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2 border-b">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Tendencias</span>
                    </div>
                    {trending.slice(0, 3).map((item, index) => (
                      <div
                        key={`trending-${index}`}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-50",
                          selectedIndex === (history.length + index) && "bg-gray-100"
                        )}
                        onClick={() => handleSuggestionSelect({
                          id: `trending-${index}`,
                          text: item,
                          type: 'trending'
                        })}
                      >
                        <TrendingUp className="w-3 h-3 text-orange-400" />
                        <span className="text-sm">{item}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Popular
                        </Badge>
                      </div>
                    ))}
                  </>
                )}

                {/* Sugerencias de búsqueda */}
                {showSuggestions && value.trim() && suggestions.length > 0 && (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2 border-b">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Sugerencias</span>
                    </div>
                    {suggestions.slice(0, 8).map((suggestion, index) => (
                      <div
                        key={suggestion.id}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50",
                          selectedIndex === index && "bg-gray-100"
                        )}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="flex items-center space-x-2">
                          <Search className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{suggestion.text}</span>
                          {suggestion.category && (
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          )}
                        </div>
                        {suggestion.count && (
                          <span className="text-xs text-gray-500">
                            {suggestion.count} resultados
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : value.trim() ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No hay sugerencias para &quot;{value}&quot;
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                Escribe para buscar productos
              </div>
            )}

            {/* Footer con shortcuts */}
            <div className="border-t bg-gray-50 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span>↑↓ navegar</span>
                  <span>↵ seleccionar</span>
                  <span>esc cerrar</span>
                </div>
                {value.trim() && (
                  <div className="flex items-center space-x-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>Enter para buscar &quot;{value}&quot;</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };