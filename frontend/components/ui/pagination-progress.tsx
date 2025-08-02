import * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Loader2, 
  ArrowUp, 
  MoreHorizontal,
  TrendingUp,
  Eye,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProgressProps {
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  total?: number;
  loaded?: number;
  progress?: number;
  page?: number;
  onLoadMore?: () => void;
  onScrollToTop?: () => void;
  showScrollToTop?: boolean;
  showProgress?: boolean;
  showStats?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

const PaginationProgress = React.forwardRef<HTMLDivElement, PaginationProgressProps>(
  ({
    loading = false,
    loadingMore = false,
    hasMore = false,
    total = 0,
    loaded = 0,
    progress = 0,
    page = 1,
    onLoadMore,
    onScrollToTop,
    showScrollToTop = false,
    showProgress = true,
    showStats = true,
    variant = "default",
    className,
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    // Controlar visibilidad basada en scroll
    React.useEffect(() => {
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setIsVisible(scrollTop > 200);
      };

      if (showScrollToTop) {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }
    }, [showScrollToTop]);

    // Variantes de diseño
    if (variant === "compact") {
      return (
        <div 
          ref={ref}
          className={cn(
            "flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border",
            className
          )}
        >
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="text-xs">
              {loaded} de {total}
            </Badge>
            {showProgress && (
              <Progress value={progress} className="w-20 h-2" />
            )}
          </div>
          
          {hasMore && (
            <Button
              variant="liquorOrange"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="px-3 py-1 h-8"
            >
              {loadingMore ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Más"
              )}
            </Button>
          )}
        </div>
      );
    }

    if (variant === "detailed") {
      return (
        <div 
          ref={ref}
          className={cn(
            "bg-white rounded-xl shadow-sm border p-6 space-y-4",
            className
          )}
        >
          {/* Header con estadísticas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-liquor-orange" />
                <span className="font-semibold text-gray-900">
                  {loaded.toLocaleString()} productos cargados
                </span>
              </div>
              {total > 0 && (
                <Badge variant="outline" className="text-xs">
                  de {total.toLocaleString()} total
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                Página {page}
              </Badge>
              {showScrollToTop && isVisible && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onScrollToTop}
                  className="w-8 h-8"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Barra de progreso */}
          {showProgress && total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progreso de carga</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Estadísticas adicionales */}
          {showStats && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{page}</div>
                <div className="text-xs text-gray-500">Páginas vistas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-liquor-orange">
                  {Math.round(progress)}%
                </div>
                <div className="text-xs text-gray-500">Completado</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {hasMore ? (total - loaded).toLocaleString() : '0'}
                </div>
                <div className="text-xs text-gray-500">Restantes</div>
              </div>
            </div>
          )}

          {/* Botón de cargar más */}
          {hasMore && (
            <Button
              variant="liquorOrange"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full py-3"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Cargando productos...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Cargar más productos ({(total - loaded).toLocaleString()} restantes)
                </>
              )}
            </Button>
          )}

          {/* Mensaje de completado */}
          {!hasMore && loaded > 0 && (
            <div className="text-center py-2">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">
                  ¡Has visto todos los productos disponibles!
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Variante default
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-white rounded-lg shadow-sm border p-4 space-y-4",
          className
        )}
      >
        {/* Stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{loaded}</span> de{" "}
              <span className="font-semibold">{total}</span> productos
            </span>
            {showProgress && total > 0 && (
              <Badge variant="secondary" className="text-xs">
                {Math.round(progress)}% cargado
              </Badge>
            )}
          </div>
          
          {showScrollToTop && isVisible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onScrollToTop}
              className="w-8 h-8"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {showProgress && total > 0 && (
          <Progress value={progress} className="h-2" />
        )}

        {/* Load more button */}
        {hasMore ? (
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full py-3"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Cargando más productos...
              </>
            ) : (
              <>
                <MoreHorizontal className="w-4 h-4 mr-2" />
                Cargar más productos ({(total - loaded).toLocaleString()} restantes)
              </>
            )}
          </Button>
        ) : loaded > 0 ? (
          <div className="text-center py-2 text-sm text-gray-500">
            ✅ Has visto todos los productos disponibles
          </div>
        ) : null}
      </div>
    );
  }
);

PaginationProgress.displayName = "PaginationProgress";

export { PaginationProgress };