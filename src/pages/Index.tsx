import { motion } from 'framer-motion';
import { ScanBarcode, Package, History, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductCard } from '@/components/products/ProductCard';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { products, prices, recentScans } = useAppStore();

  // Calculate stats
  const totalProducts = products.length;
  const totalPrices = prices.length;
  const avgSavings = 15; // Mock savings percentage

  const recentProducts = recentScans
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MainLayout>
      <PageHeader title="PriceTracker" subtitle="Suivez vos prix" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 py-6 space-y-6"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="gradient-primary rounded-2xl p-6 text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Scannez & Économisez</h2>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Comparez les prix et trouvez les meilleures offres
            </p>
            <Button
              onClick={() => navigate('/scan')}
              className="bg-white text-primary hover:bg-white/90 shadow-elevated"
            >
              <ScanBarcode className="w-5 h-5 mr-2" />
              Scanner maintenant
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 text-center shadow-soft">
            <Package className="w-6 h-6 mx-auto text-primary mb-2" />
            <span className="block text-2xl font-bold">{totalProducts}</span>
            <span className="text-xs text-muted-foreground">Produits</span>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-soft">
            <History className="w-6 h-6 mx-auto text-accent mb-2" />
            <span className="block text-2xl font-bold">{totalPrices}</span>
            <span className="text-xs text-muted-foreground">Prix suivis</span>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-soft">
            <TrendingDown className="w-6 h-6 mx-auto text-success mb-2" />
            <span className="block text-2xl font-bold">{avgSavings}%</span>
            <span className="text-xs text-muted-foreground">Économies</span>
          </div>
        </motion.div>

        {/* Recent Scans */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Derniers produits consultés</h3>
            <button
              onClick={() => navigate('/search')}
              className="text-sm text-primary font-medium"
            >
              Voir tout
            </button>
          </div>
          
          {recentProducts.length > 0 ? (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product!.id}
                  productId={product!.id}
                  onClick={() => navigate(`/product/${product!.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center shadow-soft">
              <ScanBarcode className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Aucun produit scanné récemment
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/scan')}
                className="mt-4"
              >
                Scanner un produit
              </Button>
            </div>
          )}
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          variants={itemVariants}
          className="bg-primary-muted rounded-xl p-4 border border-primary/20"
        >
          <h4 className="font-medium text-primary mb-2">💡 Astuce</h4>
          <p className="text-sm text-muted-foreground">
            Scannez régulièrement vos produits préférés pour suivre l'évolution
            des prix et identifier les meilleures offres.
          </p>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Index;
