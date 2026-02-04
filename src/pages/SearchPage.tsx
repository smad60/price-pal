import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductCard } from '@/components/products/ProductCard';
import { useAppStore } from '@/stores/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SortOption = 'name' | 'recent' | 'price-low' | 'price-high';

export default function SearchPage() {
  const navigate = useNavigate();
  const { products, prices } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode.includes(query)
      );
    }

    // Sort products
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        result.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        break;
      case 'price-low':
      case 'price-high': {
        const getLatestPrice = (productId: string) => {
          const productPrices = prices.filter((p) => p.productId === productId);
          if (productPrices.length === 0) return 0;
          return productPrices.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0].price;
        };
        result.sort((a, b) => {
          const priceA = getLatestPrice(a.id);
          const priceB = getLatestPrice(b.id);
          return sortBy === 'price-low' ? priceA - priceB : priceB - priceA;
        });
        break;
      }
    }

    return result;
  }, [products, prices, searchQuery, sortBy]);

  return (
    <MainLayout>
      <PageHeader title="Recherche" subtitle={`${products.length} produits`} />

      <div className="px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card rounded-xl p-4 shadow-soft"
          >
            <p className="text-sm font-medium mb-3">Trier par</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'recent', label: 'Plus récent' },
                { value: 'name', label: 'Nom A-Z' },
                { value: 'price-low', label: 'Prix ↑' },
                { value: 'price-high', label: 'Prix ↓' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(option.value as SortOption)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                productId={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Aucun produit trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Essayez avec d\'autres termes de recherche'
                : 'Commencez par scanner un produit'}
            </p>
            <Button onClick={() => navigate('/scan')}>
              Scanner un produit
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
