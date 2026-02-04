import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';

export default function AddPricePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products, vendors, addPrice, addVendor } = useAppStore();

  const product = products.find((p) => p.id === productId);

  const [formData, setFormData] = useState({
    price: '',
    vendorId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [newVendorName, setNewVendorName] = useState('');
  const [showVendorDialog, setShowVendorDialog] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un prix valide.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.vendorId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un vendeur.',
        variant: 'destructive',
      });
      return;
    }

    addPrice({
      productId: product.id,
      price: parseFloat(formData.price),
      vendorId: formData.vendorId,
      date: formData.date,
      notes: formData.notes || undefined,
    });

    toast({
      title: 'Prix ajouté !',
      description: `Nouveau prix enregistré pour ${product.name}.`,
    });

    navigate(`/product/${product.id}`);
  };

  const handleAddVendor = () => {
    if (!newVendorName.trim()) return;

    const vendor = addVendor({
      name: newVendorName.trim(),
      category: 'other',
    });

    setFormData({ ...formData, vendorId: vendor.id });
    setNewVendorName('');
    setShowVendorDialog(false);

    toast({
      title: 'Vendeur ajouté',
      description: `${vendor.name} a été ajouté à la liste.`,
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Ajouter un prix"
        subtitle={product.name}
        showBack
      />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="px-4 py-6 space-y-6"
      >
        {/* Product Preview */}
        <div className="bg-card rounded-2xl p-4 shadow-soft flex items-center gap-4">
          <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center">
            {product.photo ? (
              <img
                src={product.photo}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">
                {product.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.barcode}</p>
          </div>
        </div>

        {/* Price Form */}
        <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="text-lg font-semibold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vendor">Vendeur *</Label>
              <Dialog open={showVendorDialog} onOpenChange={setShowVendorDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Plus className="w-4 h-4 mr-1" />
                    Nouveau
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un vendeur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendorName">Nom du vendeur</Label>
                      <Input
                        id="vendorName"
                        placeholder="Ex: Carrefour"
                        value={newVendorName}
                        onChange={(e) => setNewVendorName(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddVendor} className="w-full">
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Select
              value={formData.vendorId}
              onValueChange={(value) =>
                setFormData({ ...formData, vendorId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un vendeur" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: En promotion, prix habituel 5.99€"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <Button type="submit" className="w-full gradient-primary" size="lg">
          <Save className="w-5 h-5 mr-2" />
          Enregistrer le prix
        </Button>
      </motion.form>
    </MainLayout>
  );
}
