import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pharmacie_siloe_data';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
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
            STORAGE_KEY,
            JSON.stringify({
              products,
              orderItems,
            })
          );
        } catch (error) {
          console.error('Erreur lors de la sauvegarde des données:', error);
        }
      };

      saveData();
    }
  }, [products, orderItems, isLoading]);

  // Gestion des produits
  const addProduct = (name) => {
    const newProduct = {
      id: Date.now().toString(),
      name: name.trim(),
    };
    setProducts(prev => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateProduct = (id, newName) => {
    setProducts(prev =>
      prev
        .map(product =>
          product.id === id ? { ...product, name: newName.trim() } : product
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    // Supprimer aussi les éléments de commande associés
    setOrderItems(prev => prev.filter(item => item.productId !== id));
  };

  // Gestion des articles de commande
  const addToOrder = (productId, quantity) => {
    setOrderItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const updateOrderItem = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromOrder(productId);
    } else {
      setOrderItems(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeFromOrder = (productId) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        orderItems,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addToOrder,
        updateOrderItem,
        removeFromOrder,
        clearOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext doit être utilisé dans un AppProvider');
  }
  return context;
};

export default AppContext;
