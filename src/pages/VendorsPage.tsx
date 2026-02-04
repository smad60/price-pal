import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Store, Trash2, Pencil, ShoppingCart, Globe, MapPin } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppStore, Vendor } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const categoryIcons = {
  supermarket: ShoppingCart,
  online: Globe,
  local: MapPin,
  other: Store,
};

const categoryLabels = {
  supermarket: 'Supermarché',
  online: 'En ligne',
  local: 'Commerce local',
  other: 'Autre',
};

export default function VendorsPage() {
  const { toast } = useToast();
  const { vendors, prices, addVendor, updateVendor, deleteVendor } = useAppStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'supermarket' as Vendor['category'],
  });

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du vendeur est requis.',
        variant: 'destructive',
      });
      return;
    }

    addVendor({
      name: formData.name.trim(),
      category: formData.category,
    });

    setFormData({ name: '', category: 'supermarket' });
    setShowAddDialog(false);

    toast({
      title: 'Vendeur ajouté',
      description: `${formData.name} a été ajouté.`,
    });
  };

  const handleEdit = () => {
    if (!editingVendor || !formData.name.trim()) return;

    updateVendor(editingVendor.id, {
      name: formData.name.trim(),
      category: formData.category,
    });

    setEditingVendor(null);
    setFormData({ name: '', category: 'supermarket' });

    toast({
      title: 'Vendeur modifié',
      description: 'Les modifications ont été enregistrées.',
    });
  };

  const handleDelete = (vendor: Vendor) => {
    const vendorPrices = prices.filter((p) => p.vendorId === vendor.id);
    if (vendorPrices.length > 0) {
      toast({
        title: 'Impossible de supprimer',
        description: `${vendor.name} est associé à ${vendorPrices.length} prix.`,
        variant: 'destructive',
      });
      return;
    }

    deleteVendor(vendor.id);
    toast({
      title: 'Vendeur supprimé',
      description: `${vendor.name} a été supprimé.`,
    });
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({ name: vendor.name, category: vendor.category });
  };

  const getPriceCount = (vendorId: string) => {
    return prices.filter((p) => p.vendorId === vendorId).length;
  };

  return (
    <MainLayout>
      <PageHeader
        title="Vendeurs"
        subtitle={`${vendors.length} vendeurs`}
        action={
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="icon" className="gradient-primary">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un vendeur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du vendeur</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Carrefour"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: Vendor['category']) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supermarket">Supermarché</SelectItem>
                      <SelectItem value="online">En ligne</SelectItem>
                      <SelectItem value="local">Commerce local</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full gradient-primary">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-4 py-6 space-y-4">
        {vendors.length > 0 ? (
          vendors.map((vendor, index) => {
            const Icon = categoryIcons[vendor.category];
            const priceCount = getPriceCount(vendor.id);

            return (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-4 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {categoryLabels[vendor.category]} • {priceCount} prix
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Dialog
                      open={editingVendor?.id === vendor.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingVendor(null);
                          setFormData({ name: '', category: 'supermarket' });
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(vendor)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier le vendeur</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="editName">Nom du vendeur</Label>
                            <Input
                              id="editName"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editCategory">Catégorie</Label>
                            <Select
                              value={formData.category}
                              onValueChange={(value: Vendor['category']) =>
                                setFormData({ ...formData, category: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="supermarket">Supermarché</SelectItem>
                                <SelectItem value="online">En ligne</SelectItem>
                                <SelectItem value="local">Commerce local</SelectItem>
                                <SelectItem value="other">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleEdit} className="w-full">
                            Enregistrer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer ce vendeur ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {priceCount > 0
                              ? `Ce vendeur est associé à ${priceCount} prix et ne peut pas être supprimé.`
                              : 'Cette action est irréversible.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          {priceCount === 0 && (
                            <AlertDialogAction onClick={() => handleDelete(vendor)}>
                              Supprimer
                            </AlertDialogAction>
                          )}
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Aucun vendeur</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ajoutez des vendeurs pour suivre les prix
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un vendeur
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
