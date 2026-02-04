import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Vendor {
  id: string;
  name: string;
  category: 'supermarket' | 'online' | 'local' | 'other';
  logo?: string;
}

export interface PriceEntry {
  id: string;
  productId: string;
  price: number;
  vendorId: string;
  date: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  photo?: string;
  dateAdded: string;
  category?: string;
}

export interface ShoppingListItem {
  id: string;
  listId: string;
  productId: string;
  quantity: number;
  purchased: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  dateCreated: string;
  items: ShoppingListItem[];
}

interface AppState {
  products: Product[];
  prices: PriceEntry[];
  vendors: Vendor[];
  shoppingLists: ShoppingList[];
  recentScans: string[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'dateAdded'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  
  // Price actions
  addPrice: (price: Omit<PriceEntry, 'id'>) => void;
  updatePrice: (id: string, price: Partial<PriceEntry>) => void;
  deletePrice: (id: string) => void;
  getPricesForProduct: (productId: string) => PriceEntry[];
  
  // Vendor actions
  addVendor: (vendor: Omit<Vendor, 'id'>) => Vendor;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  
  // Shopping list actions
  addShoppingList: (name: string) => ShoppingList;
  updateShoppingList: (id: string, list: Partial<ShoppingList>) => void;
  deleteShoppingList: (id: string) => void;
  addItemToList: (listId: string, productId: string, quantity?: number) => void;
  removeItemFromList: (listId: string, itemId: string) => void;
  toggleItemPurchased: (listId: string, itemId: string) => void;
  updateItemQuantity: (listId: string, itemId: string, quantity: number) => void;
  
  // Recent scans
  addRecentScan: (productId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Sample data
const sampleVendors: Vendor[] = [
  { id: 'v1', name: 'Carrefour', category: 'supermarket' },
  { id: 'v2', name: 'Leclerc', category: 'supermarket' },
  { id: 'v3', name: 'Amazon', category: 'online' },
  { id: 'v4', name: 'Auchan', category: 'supermarket' },
  { id: 'v5', name: 'Intermarché', category: 'supermarket' },
];

const sampleProducts: Product[] = [
  { id: 'p1', name: 'Nutella 750g', barcode: '3017620422003', dateAdded: '2024-01-15' },
  { id: 'p2', name: 'Coca-Cola 1.5L', barcode: '5449000000996', dateAdded: '2024-01-20' },
  { id: 'p3', name: 'Pâtes Barilla 500g', barcode: '8076800105735', dateAdded: '2024-02-01' },
];

const samplePrices: PriceEntry[] = [
  { id: 'pr1', productId: 'p1', price: 5.99, vendorId: 'v1', date: '2024-01-15' },
  { id: 'pr2', productId: 'p1', price: 6.49, vendorId: 'v2', date: '2024-01-20' },
  { id: 'pr3', productId: 'p1', price: 5.79, vendorId: 'v3', date: '2024-02-01' },
  { id: 'pr4', productId: 'p2', price: 1.89, vendorId: 'v1', date: '2024-01-20' },
  { id: 'pr5', productId: 'p2', price: 1.79, vendorId: 'v4', date: '2024-01-25' },
  { id: 'pr6', productId: 'p3', price: 1.29, vendorId: 'v1', date: '2024-02-01' },
  { id: 'pr7', productId: 'p3', price: 1.19, vendorId: 'v5', date: '2024-02-05' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: sampleProducts,
      prices: samplePrices,
      vendors: sampleVendors,
      shoppingLists: [],
      recentScans: ['p1', 'p2'],

      // Product actions
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: generateId(),
          dateAdded: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        return newProduct;
      },
      
      updateProduct: (id, product) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...product } : p
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          prices: state.prices.filter((p) => p.productId !== id),
          recentScans: state.recentScans.filter((s) => s !== id),
        }));
      },
      
      getProductByBarcode: (barcode) => {
        return get().products.find((p) => p.barcode === barcode);
      },

      // Price actions
      addPrice: (price) => {
        const newPrice: PriceEntry = {
          ...price,
          id: generateId(),
        };
        set((state) => ({ prices: [...state.prices, newPrice] }));
      },
      
      updatePrice: (id, price) => {
        set((state) => ({
          prices: state.prices.map((p) =>
            p.id === id ? { ...p, ...price } : p
          ),
        }));
      },
      
      deletePrice: (id) => {
        set((state) => ({
          prices: state.prices.filter((p) => p.id !== id),
        }));
      },
      
      getPricesForProduct: (productId) => {
        return get().prices.filter((p) => p.productId === productId);
      },

      // Vendor actions
      addVendor: (vendor) => {
        const newVendor: Vendor = {
          ...vendor,
          id: generateId(),
        };
        set((state) => ({ vendors: [...state.vendors, newVendor] }));
        return newVendor;
      },
      
      updateVendor: (id, vendor) => {
        set((state) => ({
          vendors: state.vendors.map((v) =>
            v.id === id ? { ...v, ...vendor } : v
          ),
        }));
      },
      
      deleteVendor: (id) => {
        set((state) => ({
          vendors: state.vendors.filter((v) => v.id !== id),
        }));
      },

      // Shopping list actions
      addShoppingList: (name) => {
        const newList: ShoppingList = {
          id: generateId(),
          name,
          dateCreated: new Date().toISOString().split('T')[0],
          items: [],
        };
        set((state) => ({ shoppingLists: [...state.shoppingLists, newList] }));
        return newList;
      },
      
      updateShoppingList: (id, list) => {
        set((state) => ({
          shoppingLists: state.shoppingLists.map((l) =>
            l.id === id ? { ...l, ...list } : l
          ),
        }));
      },
      
      deleteShoppingList: (id) => {
        set((state) => ({
          shoppingLists: state.shoppingLists.filter((l) => l.id !== id),
        }));
      },
      
      addItemToList: (listId, productId, quantity = 1) => {
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) => {
            if (list.id !== listId) return list;
            const existingItem = list.items.find((i) => i.productId === productId);
            if (existingItem) {
              return {
                ...list,
                items: list.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i
                ),
              };
            }
            return {
              ...list,
              items: [
                ...list.items,
                { id: generateId(), listId, productId, quantity, purchased: false },
              ],
            };
          }),
        }));
      },
      
      removeItemFromList: (listId, itemId) => {
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) =>
            list.id === listId
              ? { ...list, items: list.items.filter((i) => i.id !== itemId) }
              : list
          ),
        }));
      },
      
      toggleItemPurchased: (listId, itemId) => {
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((i) =>
                    i.id === itemId ? { ...i, purchased: !i.purchased } : i
                  ),
                }
              : list
          ),
        }));
      },
      
      updateItemQuantity: (listId, itemId, quantity) => {
        set((state) => ({
          shoppingLists: state.shoppingLists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((i) =>
                    i.id === itemId ? { ...i, quantity } : i
                  ),
                }
              : list
          ),
        }));
      },

      // Recent scans
      addRecentScan: (productId) => {
        set((state) => {
          const filtered = state.recentScans.filter((id) => id !== productId);
          return { recentScans: [productId, ...filtered].slice(0, 20) };
        });
      },
    }),
    {
      name: 'price-tracker-storage',
    }
  )
);
