import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  Check,
  Trash2,
  Search,
  Package,
  Share2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ShoppingListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    shoppingLists,
    products,
    prices,
    addItemToList,
    removeItemFromList,
    toggleItemPurchased,
    updateItemQuantity,
  } = useAppStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const list = shoppingLists.find((l) => l.id === id);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) || p.barcode.includes(query)
    );
  }, [products, searchQuery]);

  if (!list) {
    return (
      <MainLayout>
        <PageHeader title="Liste non trouvée" showBack />
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Cette liste n'existe pas.</p>
          <Button onClick={() => navigate('/lists')} className="mt-4">
            Retour aux listes
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getLatestPrice = (productId: string) => {
    const productPrices = prices.filter((p) => p.productId === productId);
    if (productPrices.length === 0) return null;
    return productPrices.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };

  const totalEstimate = list.items.reduce((acc, item) => {
    const price = getLatestPrice(item.productId);
    return acc + (price ? price.price * item.quantity : 0);
  }, 0);

  const purchasedCount = list.items.filter((i) => i.purchased).length;
  const progress = list.items.length > 0
    ? (purchasedCount / list.items.length) * 100
    : 0;

  const handleAddProduct = (productId: string) => {
    addItemToList(list.id, productId);
    setShowAddDialog(false);
    setSearchQuery('');
    
    const product = products.find((p) => p.id === productId);
    toast({
      title: 'Article ajouté',
      description: `${product?.name} ajouté à la liste.`,
    });
  };

  const handleShare = async () => {
    const text = list.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return `${item.purchased ? '✓' : '○'} ${product?.name} x${item.quantity}`;
      })
      .join('\n');

    const shareText = `${list.name}\n\n${text}\n\nTotal estimé: ${totalEstimate.toFixed(2)} €`;

    if (navigator.share) {
      try {
        await navigator.share({ title: list.name, text: shareText });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copié !',
        description: 'La liste a été copiée dans le presse-papier.',
      });
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title={list.name}
        subtitle={`${list.items.length} article${list.items.length > 1 ? 's' : ''}`}
        showBack
        action={
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        }
      />

      <div className="px-4 py-6 space-y-6">
        {/* Progress & Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Progression</p>
              <p className="text-2xl font-bold">
                {purchasedCount}/{list.items.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total estimé</p>
              <p className="text-2xl font-bold text-primary">
                {totalEstimate.toFixed(2)} €
              </p>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Add Product Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full gradient-primary" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Ajouter un article</DialogTitle>
            </DialogHeader>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isInList = list.items.some(
                    (i) => i.productId === product.id
                  );
                  const price = getLatestPrice(product.id);

                  return (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product.id)}
                      disabled={isInList}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                        isInList
                          ? 'bg-muted opacity-50 cursor-not-allowed'
                          : 'bg-secondary hover:bg-secondary/80'
                      )}
                    >
                      <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {price ? `${price.price.toFixed(2)} €` : 'Prix non défini'}
                        </p>
                      </div>
                      {isInList && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucun produit trouvé</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Items List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {list.items.map((item, index) => {
              const product = products.find((p) => p.id === item.productId);
              const price = getLatestPrice(item.productId);
              if (!product) return null;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'bg-card rounded-xl p-4 shadow-soft transition-opacity',
                    item.purchased && 'opacity-60'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={item.purchased}
                      onCheckedChange={() =>
                        toggleItemPurchased(list.id, item.id)
                      }
                      className="w-6 h-6"
                    />
                    
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <p
                        className={cn(
                          'font-medium',
                          item.purchased && 'line-through text-muted-foreground'
                        )}
                      >
                        {product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {price
                          ? `${price.price.toFixed(2)} € × ${item.quantity} = ${(
                              price.price * item.quantity
                            ).toFixed(2)} €`
                          : 'Prix non défini'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateItemQuantity(
                            list.id,
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateItemQuantity(list.id, item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItemFromList(list.id, item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {list.items.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Liste vide</h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez des articles à votre liste
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
