import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { Camera, Flashlight, FlashlightOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose?: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!containerRef.current) return;
    
    try {
      setError(null);
      const html5QrCode = new Html5Qrcode('scanner-container');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.7777778,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        () => {} // Ignore errors during scanning
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const toggleTorch = async () => {
    // Note: Torch functionality may not be available on all devices
    setTorchOn(!torchOn);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 gradient-scanner flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-top">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/10"
        >
          <X className="w-6 h-6" />
        </Button>
        <span className="text-white font-medium">Scanner un code-barres</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTorch}
          className="text-white hover:bg-white/10"
        >
          {torchOn ? (
            <FlashlightOff className="w-6 h-6" />
          ) : (
            <Flashlight className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="relative w-full max-w-sm">
          {/* Scanner container */}
          <div
            id="scanner-container"
            ref={containerRef}
            className="w-full aspect-video rounded-2xl overflow-hidden bg-black"
          />
          
          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-lg" />
              
              {/* Scanning line */}
              <div className="absolute left-8 right-8 h-0.5 bg-primary animate-scan" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-2xl">
              <div className="text-center p-6">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-white text-sm">{error}</p>
                <Button onClick={startScanning} className="mt-4">
                  Réessayer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-8 text-center safe-bottom">
        <p className="text-white/80 text-sm">
          Placez le code-barres dans le cadre pour le scanner automatiquement
        </p>
      </div>
    </motion.div>
  );
}
