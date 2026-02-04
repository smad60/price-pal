import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Save } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAppStore } from '@/stores/useAppStore';
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
import { useToast } from '@/hooks/use-toast';

export default function AddProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { vendors, addProduct, addPrice, addRecentScan } = useAppStore();

  const barcodeFromUrl = searchParams.get('barcode') || '';

  const [formData, setFormData] = useState({
    name: '',
    barcode: barcodeFromUrl,
    photo: '',
    firstPrice: '',
    vendorId: '',
    priceDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du produit est requis.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.barcode.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le code-barres est requis.',
        variant: 'destructive',
      });
      return;
    }

    const newProduct = addProduct({
      name: formData.name.trim(),
      barcode: formData.barcode.trim(),
      photo: formData.photo || undefined,
    });

    if (formData.firstPrice && formData.vendorId) {
      addPrice({
        productId: newProduct.id,
        price: parseFloat(formData.firstPrice),
        vendorId: formData.vendorId,
        date: formData.priceDate,
      });
    }

    addRecentScan(newProduct.id);

    toast({
      title: 'Produit ajouté !',
      description: `${newProduct.name} a été ajouté à votre base.`,
    });

    navigate(`/product/${newProduct.id}`);
  };

  return (
    <MainLayout>
      <PageHeader title="Ajouter un produit" showBack />

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="px-4 py-6 space-y-6"
      >
        {/* Product Photo */}
        <div className="flex justify-center">
          <button
            type="button"
            className="w-24 h-24 bg-secondary rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors"
          >
            <Camera className="w-8 h-8 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Photo</span>
          </button>
        </div>

        {/* Product Info */}
        <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="font-semibold">Informations produit</h3>

          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              placeholder="Ex: Nutella 750g"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Code-barres *</Label>
            <Input
              id="barcode"
              placeholder="Ex: 3017620422003"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
            />
          </div>
        </div>

        {/* First Price (Optional) */}
        <div className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
          <h3 className="font-semibold">Premier prix (optionnel)</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.firstPrice}
                onChange={(e) =>
                  setFormData({ ...formData, firstPrice: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.priceDate}
                onChange={(e) =>
                  setFormData({ ...formData, priceDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendeur</Label>
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
        </div>

        <Button type="submit" className="w-full gradient-primary" size="lg">
          <Save className="w-5 h-5 mr-2" />
          Enregistrer le produit
        </Button>
      </motion.form>
    </MainLayout>
  );
}
