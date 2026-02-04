import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pencil,
  Trash2,
  Plus,
  TrendingDown,
  TrendingUp,
  Store,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products, prices, vendors, deleteProduct, deletePrice } = useAppStore();

  const product = products.find((p) => p.id === id);
  const productPrices = useMemo(() => {
    return prices
      .filter((p) => p.productId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [prices, id]);

  if (!product) {
    return (
      <MainLayout>
        <PageHeader title="Produit non trouvé" showBack />
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Ce produit n'existe pas.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Retour à l'accueil
          </Button>
        </div>
      </MainLayout>
    );
  }

  const lowestPrice = productPrices.length > 0
    ? Math.min(...productPrices.map((p) => p.price))
    : 0;
  const highestPrice = productPrices.length > 0
    ? Math.max(...productPrices.map((p) => p.price))
    : 0;
  const averagePrice = productPrices.length > 0
    ? productPrices.reduce((acc, p) => acc + p.price, 0) / productPrices.length
    : 0;

  const handleDeleteProduct = () => {
    deleteProduct(product.id);
    toast({
      title: 'Produit supprimé',
      description: `${product.name} a été supprimé.`,
    });
    navigate('/');
  };

  const handleDeletePrice = (priceId: string) => {
    deletePrice(priceId);
    toast({
      title: 'Prix supprimé',
      description: 'L\'entrée de prix a été supprimée.',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title={product.name}
        showBack
        action={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit-product/${product.id}`)}
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement le produit et tout son historique de prix.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProduct}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="px-4 py-6 space-y-6">
        {/* Product Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {product.photo ? (
                <img
                  src={product.photo}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">
                  {product.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Code-barres: {product.barcode}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ajouté le {formatDate(product.dateAdded)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Price Stats */}
        {productPrices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-success/10 rounded-xl p-4 text-center">
              <TrendingDown className="w-5 h-5 mx-auto text-success mb-2" />
              <span className="block text-lg font-bold text-success">
                {lowestPrice.toFixed(2)} €
              </span>
              <span className="text-xs text-muted-foreground">Minimum</span>
            </div>
            <div className="bg-card rounded-xl p-4 text-center shadow-soft">
              <BarChart3 className="w-5 h-5 mx-auto text-primary mb-2" />
              <span className="block text-lg font-bold">
                {averagePrice.toFixed(2)} €
              </span>
              <span className="text-xs text-muted-foreground">Moyenne</span>
            </div>
            <div className="bg-destructive/10 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-destructive mb-2" />
              <span className="block text-lg font-bold text-destructive">
                {highestPrice.toFixed(2)} €
              </span>
              <span className="text-xs text-muted-foreground">Maximum</span>
            </div>
          </motion.div>
        )}

        {/* Add Price Button */}
        <Button
          onClick={() => navigate(`/add-price/${product.id}`)}
          className="w-full gradient-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un prix
        </Button>

        {/* Price History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold mb-3">Historique des prix</h3>
          
          {productPrices.length > 0 ? (
            <div className="space-y-3">
              {productPrices.map((price, index) => {
                const vendor = vendors.find((v) => v.id === price.vendorId);
                const previousPrice = productPrices[index + 1];
                const priceChange = previousPrice
                  ? ((price.price - previousPrice.price) / previousPrice.price) * 100
                  : 0;

                return (
                  <motion.div
                    key={price.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-xl p-4 shadow-soft"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                          <Store className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {vendor?.name || 'Vendeur inconnu'}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(price.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {price.price.toFixed(2)} €
                        </p>
                        {priceChange !== 0 && (
                          <span
                            className={`text-xs font-medium ${
                              priceChange > 0 ? 'text-destructive' : 'text-success'
                            }`}
                          >
                            {priceChange > 0 ? '+' : ''}
                            {priceChange.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    {price.notes && (
                      <p className="text-sm text-muted-foreground mt-2 pl-13">
                        {price.notes}
                      </p>
                    )}
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePrice(price.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center shadow-soft">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                Aucun prix enregistré pour ce produit
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
