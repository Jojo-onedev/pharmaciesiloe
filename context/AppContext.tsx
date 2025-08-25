import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  OrderItem, 
  Order, 
  AppContextType,
  OrderItemWithDetails
} from '../types';
import database from '../services/Database';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger les données au démarrage
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        console.log('Initialisation de la base de données...');
        // Initialiser la base de données
        await database.initDB();
        
        if (!isMounted) return;
        
        console.log('Chargement des produits...');
        // Charger les produits depuis la base de données
        const loadedProducts = await database.getProducts();
        if (isMounted) {
          setProducts(loadedProducts);
          console.log(`${loadedProducts.length} produits chargés`);
        }
        
        if (!isMounted) return;
        
        console.log('Chargement des commandes...');
        // Charger les commandes depuis la base de données
        const loadedOrders = await database.getOrders();
        if (isMounted) {
          setOrders(loadedOrders);
          console.log(`${loadedOrders.length} commandes chargées`);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    // Nettoyage lors du démontage
    return () => {
      isMounted = false;
      database.closeDatabase().catch(error => {
        console.error('Erreur lors de la fermeture de la base de données:', error);
      });
    };
  }, []);

  // Sauvegarder les produits
  const saveProducts = useCallback(async (productsToSave: Product[]) => {
    try {
      // Mettre à jour les produits dans la base de données
      for (const product of productsToSave) {
        if (product.id) {
          await database.updateProduct(product);
        } else {
          await database.addProduct(product);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des produits:', error);
      throw error;
    }
  }, []);

  // Gestion des produits
  const addProduct = useCallback(async (productData: Omit<Product, 'id'> & { id?: string }) => {
    try {
      const newProduct = await database.addProduct(productData);
      setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
      return newProduct;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Omit<Product, 'id'>>) => {
    setProducts(prev =>
      prev
        .map(product =>
          product.id === id ? { ...product, ...updates } : product
        )
        .sort((a, b) => a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'}))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    // Supprimer aussi les éléments de commande associés
    setOrderItems((prev: OrderItem[]) => prev.filter(item => item.productId !== id));
  }, []);

  // Gestion des commandes
  const updateOrderItem = useCallback((productId: string, quantity: number) => {
    setOrderItems((prev: OrderItem[]) => {
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
        // Créer un nouvel OrderItem avec des valeurs par défaut
        const product = products.find(p => p.id === productId);
        return [...prev, createNewOrderItem(productId, quantity, product)];
      }
    });
  }, [products]);

  const addToOrder = useCallback((productId: string, quantity: number) => {
    setOrderItems((prev: OrderItem[]) => {
      const currentQuantity = prev.find(item => item.productId === productId)?.quantity || 0;
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
        const product = products.find(p => p.id === productId);
        const newOrderItem = createNewOrderItem(productId, newQuantity, product);
        return [...prev, newOrderItem];
      }
    });
  }, [products]);

  const removeFromOrder = useCallback((productId: string) => {
    setOrderItems((prev: OrderItem[]) => prev.filter(item => item.productId !== productId));
  }, []);

  const clearOrder = useCallback(() => {
    setOrderItems([]);
  }, []);

  // Fonction utilitaire pour créer un nouvel OrderItem avec des valeurs par défaut
  const createNewOrderItem = (productId: string, quantity: number, product?: Product): OrderItem => {
    return {
      id: Date.now().toString(),
      orderId: 'temp',
      productId,
      quantity,
      productName: product?.name || '',
      productPrice: product?.price || 0,
      productImage: product?.image,
      productCategory: product?.category || 'Médicaments'
    };
  };

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'date'>) => {
    try {
      const newOrder = await database.addOrder(order);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      // Vider le panier après la commande
      setOrderItems([]);
      return newOrder;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      throw error;
    }
  }, []);

  // Effet pour sauvegarder les produits lors des modifications
  useEffect(() => {
    if (isLoading) return;
    
    const saveProductsToDB = async () => {
      try {
        console.log('Sauvegarde des produits...');
        await saveProducts(products);
        console.log('Produits sauvegardés avec succès');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des produits:', error);
      }
    };
    
    saveProductsToDB();
  }, [products, isLoading, saveProducts]);

  // Les commandes sont automatiquement sauvegardées dans la base de données via addOrder

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
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé
export const useAppContext = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext doit être utilisé à l\'intérieur d\'un AppProvider');
  }
  return context;
};

export default AppContext;
