import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ScanPage from "./pages/ScanPage";
import SearchPage from "./pages/SearchPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddProductPage from "./pages/AddProductPage";
import AddPricePage from "./pages/AddPricePage";
import VendorsPage from "./pages/VendorsPage";
import ShoppingListsPage from "./pages/ShoppingListsPage";
import ShoppingListDetailPage from "./pages/ShoppingListDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/add-price/:productId" element={<AddPricePage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/lists" element={<ShoppingListsPage />} />
          <Route path="/list/:id" element={<ShoppingListDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
