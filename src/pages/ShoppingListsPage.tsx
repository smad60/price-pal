import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  ShoppingCart,
  Check,
  Trash2,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

export default function ShoppingListsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { shoppingLists, products, prices, addShoppingList, deleteShoppingList } =
    useAppStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleAddList = () => {
    if (!newListName.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom de la liste est requis.',
        variant: 'destructive',
      });
      return;
    }

    const list = addShoppingList(newListName.trim());
    setNewListName('');
    setShowAddDialog(false);

    toast({
      title: 'Liste créée',
      description: `${list.name} a été créée.`,
    });

    navigate(`/list/${list.id}`);
  };

  const handleDeleteList = (listId: string, listName: string) => {
    deleteShoppingList(listId);
    toast({
      title: 'Liste supprimée',
      description: `${listName} a été supprimée.`,
    });
  };

  const getListStats = (listId: string) => {
    const list = shoppingLists.find((l) => l.id === listId);
    if (!list) return { total: 0, purchased: 0, estimatedCost: 0 };

    const purchased = list.items.filter((i) => i.purchased).length;
    
    let estimatedCost = 0;
    list.items.forEach((item) => {
      const productPrices = prices.filter((p) => p.productId === item.productId);
      if (productPrices.length > 0) {
        const latestPrice = productPrices.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        estimatedCost += latestPrice.price * item.quantity;
      }
    });

    return { total: list.items.length, purchased, estimatedCost };
  };

  return (
    <MainLayout>
      <PageHeader
        title="Listes d'achats"
        subtitle={`${shoppingLists.length} liste${shoppingLists.length > 1 ? 's' : ''}`}
        action={
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="icon" className="gradient-primary">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle liste</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="listName">Nom de la liste</Label>
                  <Input
                    id="listName"
                    placeholder="Ex: Courses de la semaine"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
                  />
                </div>
                <Button onClick={handleAddList} className="w-full gradient-primary">
                  Créer la liste
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 py-6 space-y-4">
        {shoppingLists.length > 0 ? (
          shoppingLists.map((list, index) => {
            const stats = getListStats(list.id);
            const progress = stats.total > 0
              ? (stats.purchased / stats.total) * 100
              : 0;

            return (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl shadow-soft overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/list/${list.id}`)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{list.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.total} article{stats.total > 1 ? 's' : ''} •{' '}
                          {stats.estimatedCost.toFixed(2)} dh
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {stats.total > 0 && stats.purchased === stats.total && (
                        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-success" />
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {stats.total > 0 && (
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>

                <div className="border-t border-border px-4 py-2 flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette liste ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          La liste "{list.name}" et tous ses articles seront supprimés.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteList(list.id, list.name)}
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Aucune liste d'achats</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre première liste pour organiser vos courses
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer une liste
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
