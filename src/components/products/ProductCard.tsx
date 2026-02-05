import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  productId: string;
  onClick?: () => void;
}

export function ProductCard({ productId, onClick }: ProductCardProps) {
  const { products, prices, vendors } = useAppStore();
  const product = products.find((p) => p.id === productId);
  const productPrices = prices.filter((p) => p.productId === productId);

  if (!product) return null;

  const sortedPrices = [...productPrices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latestPrice = sortedPrices[0];
  const previousPrice = sortedPrices[1];
  const lowestPrice = Math.min(...productPrices.map((p) => p.price));

  const priceChange = latestPrice && previousPrice
    ? ((latestPrice.price - previousPrice.price) / previousPrice.price) * 100
    : 0;

  const latestVendor = latestPrice
    ? vendors.find((v) => v.id === latestPrice.vendorId)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card rounded-lg p-4 shadow-soft cursor-pointer hover:shadow-elevated transition-shadow"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.photo ? (
            <img
              src={product.photo}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {product.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {product.barcode}
          </p>
          
          {latestPrice && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-semibold">
                {latestPrice.price.toFixed(2)} dh
              </span>
              
              {priceChange !== 0 && (
                <span
                  className={cn(
                    'flex items-center text-xs font-medium px-2 py-0.5 rounded-full',
                    priceChange > 0
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-success/10 text-success'
                  )}
                >
                  {priceChange > 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(priceChange).toFixed(1)}%
                </span>
              )}
              
              {priceChange === 0 && previousPrice && (
                <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  <Minus className="w-3 h-3 mr-1" />
                  Stable
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-1">
            {latestVendor && (
              <span className="text-xs text-muted-foreground">
                chez {latestVendor.name}
              </span>
            )}
            {productPrices.length > 1 && (
              <span className="text-xs text-primary font-medium">
                Min: {lowestPrice.toFixed(2)} dh
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
