import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
};

type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  productName: string;
  productPrice: number;
  productImage?: string;
  productCategory: string;
};

type OrderItemWithDetails = OrderItem & {
  // Ajoutez ici des champs supplémentaires spécifiques à OrderItemWithDetails si nécessaire
};

type Order = {
  id: string;
  date: Date;
  items: OrderItemWithDetails[];
  totalItems: number;
};

type AppContextType = {
  products: Product[];
  orderItems: OrderItem[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  addToOrder: (productId: string, quantity: number) => void;
  updateOrderItem: (productId: string, quantity: number) => void;
  removeFromOrder: (productId: string) => void;
  clearOrder: () => void;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'items' | 'totalItems'>) => Order;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@pharmacie_siloe_data');
        if (savedData) {
          const { products: savedProducts, orderItems: savedOrderItems } = JSON.parse(savedData);
          setProducts(savedProducts || []);
          setOrderItems(savedOrderItems || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sauvegarder les données à chaque modification
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(
            '@pharmacie_siloe_data',
            JSON.stringify({
              products,
              orderItems,
              orders,
            })
          );
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des données:', error);
        }
      };

      saveData();
    }
  }, [products, orderItems, orders, isLoading]);

  // Gestion des produits
  const addProduct = (product: Omit<Product, 'id'> & { id?: string }) => {
    const newProduct: Product = {
      ...product,
      id: product.id || Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    // Supprimer aussi les éléments de commande associés
    setOrderItems(prev => prev.filter(item => item.productId !== id));
  };

  // Gestion des commandes
  const addToOrder = useCallback((productId: string, quantity: number) => {
    setOrderItems(prev => {
      const currentItem = prev.find(item => item.productId === productId);
      const currentQuantity = currentItem?.quantity || 0;
      const newQuantity = currentQuantity + quantity;
      
      if (newQuantity <= 0) {
        return prev.filter(item => item.productId !== productId);
      }
      
      const existingItemIndex = prev.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = { 
          ...updatedItems[existingItemIndex], 
          quantity: newQuantity 
        };
        return updatedItems;
      } else {
        // Créer un nouvel OrderItem avec tous les champs requis
        const newItem: OrderItem = { 
          id: Date.now().toString(), // ID temporaire
          orderId: 'temp', 
          productId, 
          quantity: newQuantity,
          // Champs supplémentaires requis par le type
          productName: '',
          productPrice: 0,
          productCategory: ''
        };
        return [...prev, newItem];
      }
    });
  }, []);

  const updateOrderItem = useCallback((productId: string, quantity: number) => {
    setOrderItems(prev => {
      // Si la quantité est 0, on supprime l'article de la commande
      if (quantity <= 0) {
        return prev.filter(item => item.productId !== productId);
      }
      
      // Vérifier si l'article existe déjà dans la commande
      const existingItemIndex = prev.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // Mettre à jour la quantité de l'article existant
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = { 
          ...updatedItems[existingItemIndex], 
          quantity 
        };
        return updatedItems;
      } else {
        // Créer un nouvel OrderItem avec tous les champs requis
        const newItem: OrderItem = { 
          id: Date.now().toString(), // ID temporaire
          orderId: 'temp', 
          productId, 
          quantity,
          // Champs supplémentaires requis par le type
          productName: '',
          productPrice: 0,
          productCategory: ''
        };
        return [...prev, newItem];
      }
    });
  }, []);

  const removeFromOrder = (productId: string) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const addOrder = (order: Omit<Order, 'id' | 'date' | 'items' | 'totalItems'>) => {
    // Calculer le total des articles
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Créer la nouvelle commande avec les éléments actuels du panier
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      date: new Date(),
      items: orderItems.map(item => ({
        ...item,
        // Ces champs sont déjà présents dans orderItems
        productName: item.productName,
        productPrice: item.productPrice,
        productCategory: item.productCategory,
        productImage: item.productImage,
      })),
      totalItems,
    };
    
    // Ajouter la nouvelle commande à la liste des commandes
    setOrders(prev => [newOrder, ...prev]);
    
    // Vider le panier après la commande
    setOrderItems([]);
    
    // Retourner la commande créée (utile pour les appels asynchrones)
    return newOrder;
  };

  return (
    <AppContext.Provider
      value={{
        products,
        orderItems,
        orders,
        addProduct,
        updateProduct,
        deleteProduct,
        addToOrder,
        updateOrderItem,
        removeFromOrder,
        clearOrder,
        addOrder,
      }}
    >
      {!isLoading ? children : null}
    </AppContext.Provider>
  );
};

// Hook personnalisé
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext doit être utilisé dans un AppProvider');
  }
  return context;
};

export default AppContext;
