import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

// Importar tipos del hook para consistencia
import type { FilterOptions, ActiveFilters } from "@/hooks/use-filters";

export interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: ActiveFilters) => void;
  availableFilters: FilterOptions;
  activeFilters: ActiveFilters;
  className?: string;
}

const FilterSidebar = React.forwardRef<HTMLDivElement, FilterSidebarProps>(
  ({ isOpen, onClose, onFiltersChange, availableFilters, activeFilters, className }, ref) => {
    // Extraer solo los filtros relevantes para el sidebar
    const sidebarFilters: ActiveFilters = {
      subcategorias: activeFilters.subcategorias || [],
      tamanos: activeFilters.tamanos || [],
      stock: activeFilters.stock || [],
      precioRange: activeFilters.precioRange || [availableFilters.precioMin || 0, availableFilters.precioMax || 1000],
      searchQuery: activeFilters.searchQuery
    };
    
    const [localFilters, setLocalFilters] = useState<ActiveFilters>(sidebarFilters);

    // Sincronizar con activeFilters cuando cambien
    React.useEffect(() => {
      const updatedFilters: ActiveFilters = {
        subcategorias: activeFilters.subcategorias || [],
        tamanos: activeFilters.tamanos || [],
        stock: activeFilters.stock || [],
        precioRange: activeFilters.precioRange || [availableFilters.precioMin || 0, availableFilters.precioMax || 1000],
        searchQuery: activeFilters.searchQuery
      };
      setLocalFilters(updatedFilters);
    }, [activeFilters, availableFilters]);

    // Aplicar filtros
    const handleApplyFilters = () => {
      onFiltersChange(localFilters);
      onClose();
    };

    // Limpiar filtros
    const handleClearFilters = () => {
      const clearedFilters: ActiveFilters = {
        subcategorias: [],
        tamanos: [],
        stock: [],
        precioRange: [availableFilters.precioMin || 0, availableFilters.precioMax || 1000],
      };
      setLocalFilters(clearedFilters);
      onFiltersChange(clearedFilters);
    };

    // Manejar cambio en subcategorías
    const handleSubcategoriaChange = (subcategoria: string, checked: boolean) => {
      setLocalFilters(prev => ({
        ...prev,
        subcategorias: checked 
          ? [...prev.subcategorias, subcategoria]
          : prev.subcategorias.filter(s => s !== subcategoria)
      }));
    };

    // Manejar cambio en tamaños
    const handleTamanoChange = (tamano: string, checked: boolean) => {
      setLocalFilters(prev => ({
        ...prev,
        tamanos: checked 
          ? [...prev.tamanos, tamano]
          : prev.tamanos.filter(t => t !== tamano)
      }));
    };

    // Manejar cambio en stock
    const handleStockChange = (stock: string, checked: boolean) => {
      setLocalFilters(prev => ({
        ...prev,
        stock: checked 
          ? [...prev.stock, stock]
          : prev.stock.filter(s => s !== stock)
      }));
    };

    // Contar filtros activos
    const activeFiltersCount = 
      localFilters.subcategorias.length + 
      localFilters.tamanos.length + 
      localFilters.stock.length +
      (localFilters.precioRange[0] !== (availableFilters.precioMin || 0) || 
       localFilters.precioRange[1] !== (availableFilters.precioMax || 1000) ? 1 : 0) +
      (localFilters.searchQuery && localFilters.searchQuery.trim() ? 1 : 0);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 lg:static lg:inset-auto">
        {/* Overlay para móvil */}
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={onClose}
        />
        
        {/* Panel de filtros */}
        <div 
          ref={ref}
          className={`
            fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform lg:static lg:w-full lg:h-auto lg:shadow-none
            ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            ${className}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b lg:border-b-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Filtros</h2>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount}</Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Contenido de filtros */}
          <div className="p-4 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto">
            
            {/* Rango de precio */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Precio</Label>
              <div className="px-2">
                <Slider
                  value={localFilters.precioRange}
                  onValueChange={(value) => 
                    setLocalFilters(prev => ({ ...prev, precioRange: value as [number, number] }))
                  }
                  min={availableFilters.precioMin || 0}
                  max={availableFilters.precioMax || 1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>S/{localFilters.precioRange[0]}</span>
                  <span>S/{localFilters.precioRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Subcategorías */}
            {availableFilters.subcategorias && availableFilters.subcategorias.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Subcategoría</Label>
                <div className="space-y-2">
                  {availableFilters.subcategorias.map((subcategoria) => (
                    <div key={subcategoria} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subcategoria-${subcategoria}`}
                        checked={localFilters.subcategorias.includes(subcategoria)}
                        onCheckedChange={(checked) => 
                          handleSubcategoriaChange(subcategoria, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`subcategoria-${subcategoria}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {subcategoria}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tamaños */}
            {availableFilters.tamanos && availableFilters.tamanos.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tamaño</Label>
                <div className="space-y-2">
                  {availableFilters.tamanos.map((tamano) => (
                    <div key={tamano} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tamano-${tamano}`}
                        checked={localFilters.tamanos.includes(tamano)}
                        onCheckedChange={(checked) => 
                          handleTamanoChange(tamano, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`tamano-${tamano}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {tamano}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {availableFilters.stock && availableFilters.stock.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Disponibilidad</Label>
                <div className="space-y-2">
                  {availableFilters.stock.map((stock) => (
                    <div key={stock} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stock-${stock}`}
                        checked={localFilters.stock.includes(stock)}
                        onCheckedChange={(checked) => 
                          handleStockChange(stock, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`stock-${stock}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {stock}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="p-4 border-t bg-white space-y-2">
            <Button 
              onClick={handleApplyFilters}
              className="w-full"
              variant="liquorOrange"
            >
              Aplicar Filtros ({activeFiltersCount})
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button 
                onClick={handleClearFilters}
                variant="outline"
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FilterSidebar.displayName = "FilterSidebar";

export { FilterSidebar };