import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';

export default function ScanPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProductByBarcode, addRecentScan } = useAppStore();
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = (barcode: string) => {
    const existingProduct = getProductByBarcode(barcode);
    
    if (existingProduct) {
      addRecentScan(existingProduct.id);
      toast({
        title: 'Produit trouvé !',
        description: existingProduct.name,
      });
      navigate(`/product/${existingProduct.id}`);
    } else {
      toast({
        title: 'Nouveau produit',
        description: 'Ce produit n\'est pas encore dans votre base.',
      });
      navigate(`/add-product?barcode=${barcode}`);
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    navigate(-1);
  };

  return (
    <AnimatePresence>
      {isScanning && (
        <BarcodeScanner onScan={handleScan} onClose={handleClose} />
      )}
    </AnimatePresence>
  );
}
