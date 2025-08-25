import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ToastAndroid, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../../context/AppContext';
import { Product, OrderItem, OrderItemWithDetails } from '../../../types';

export default function OrderScreen() {
  const { 
    products, 
    orderItems = [], 
    updateOrderItem, 
    addOrder,
    clearOrder
  } = useAppContext();

  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);

  // Fonction pour mettre à jour la quantité d'un produit
  const updateQuantity = (productId: string, change: number) => {
    const currentItem = orderItems.find(item => item.productId === productId);
    const currentQuantity = currentItem ? currentItem.quantity : 0;
    let newQuantity = currentQuantity + change;
    
    // On ne peut pas avoir une quantité négative
    if (newQuantity < 0) return;
    
    // Si la quantité est à 0, on supprime l'article de la commande
    if (newQuantity === 0) {
      updateOrderItem(productId, 0);
    } else {
      // Sinon on met à jour la quantité
      updateOrderItem(productId, newQuantity);
    }
  };

  // Obtenir la quantité totale d'articles dans la commande
  const getTotalQuantity = (): number => {
    return orderItems.reduce((total: number, item) => total + item.quantity, 0);
  };

  // Vérifier si la commande est vide
  const isOrderEmpty = getTotalQuantity() === 0;

  const handleValidateOrder = () => {
    if (isOrderEmpty) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un article à la commande');
      return;
    }
    setIsPreviewVisible(true);
  };

  const handleConfirmOrder = async () => {
    try {
      // Préparer les détails de la commande avec tous les champs requis
      const orderItemsWithDetails: OrderItemWithDetails[] = [];
      
      orderItems.forEach(item => {
        if (item.quantity > 0) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            orderItemsWithDetails.push({
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              orderId: 'temp', // Sera remplacé lors de la création de la commande
              productId: item.productId,
              quantity: item.quantity,
              productName: product.name,
              productPrice: product.price,
              productImage: product.image,
              productCategory: product.category || 'Médicaments'
            });
          }
        }
      });
    
      if (orderItemsWithDetails.length === 0) {
        Alert.alert('Erreur', 'Aucun article dans la commande');
        return;
      }
      
      // Calculer le nombre total d'articles, le montant total et préparer les articles avec tous les détails
      let totalItems = 0;
      let totalAmount = 0;
      const completeOrderItems: OrderItemWithDetails[] = [];
      
      orderItemsWithDetails.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalItems += item.quantity;
          totalAmount += item.quantity * product.price;
          
          // Créer un article de commande complet avec tous les champs requis
          completeOrderItems.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            orderId: 'temp', // Sera remplacé lors de la création de la commande
            productId: item.productId,
            quantity: item.quantity,
            productName: product.name,
            productPrice: product.price,
            productImage: product.image,
            productCategory: product.category
          });
        }
      });
      
      if (completeOrderItems.length === 0) {
        throw new Error('Aucun article valide dans la commande');
      }
      
      // Ajouter la commande à l'historique
      await addOrder({
        items: completeOrderItems,
        totalItems,
        total: totalAmount,
        customerName: 'Client' // Ajout d'un nom de client par défaut
      });
      
      // Afficher une notification de succès
      ToastAndroid.show('Commande validée avec succès !', ToastAndroid.SHORT);
      
      // Fermer la modale et réinitialiser la commande
      setIsPreviewVisible(false);
      clearOrder();
    } catch (error) {
      console.error('Erreur lors de la validation de la commande:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la validation de la commande');
    }
  };

  // Obtenir tous les produits triés par ordre alphabétique
  const sortedProducts = (products || [])
    .map(product => {
      const orderItem = orderItems?.find(item => item.productId === product.id);
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        quantity: orderItem?.quantity || 0
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'})) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle Commande</Text>
        <Text style={styles.subtitle}>Sélectionnez les produits</Text>
      </View>

      <ScrollView style={styles.productsContainer}>
        {sortedProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun produit disponible</Text>
          </View>
        ) : (
          sortedProducts.map(({ id, name, category, image, quantity }) => (
          <View 
            key={id} 
            style={[
              styles.productCard,
              quantity > 0 && styles.selectedProduct
            ]}
          >
            <View style={styles.productInfo}>
              {image ? (
                <Image 
                  source={{ uri: image }} 
                  style={styles.productImage}
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Ionicons name="medkit-outline" size={32} color="#ccc" />
                </View>
              )}
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={1}>
                  {name}
                </Text>
                <Text style={styles.productCategory}>
                  {category}
                </Text>
              </View>
            </View>
            
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={[
                  styles.quantityButton,
                  quantity === 0 && styles.disabledButton
                ]}
                disabled={quantity === 0}
                onPress={() => updateQuantity(id, -1)}
              >
                <Ionicons name="remove" size={20} color="#2E7D32" />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{quantity}</Text>
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(id, 1)}
              >
                <Ionicons name="add" size={20} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>
        )))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {getTotalQuantity()} article{getTotalQuantity() > 1 ? 's' : ''} sélectionné{getTotalQuantity() > 1 ? 's' : ''}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.validateButton}
          onPress={handleValidateOrder}
        >
          <Text style={styles.validateButtonText}>
            Valider la commande
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modale de prévisualisation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPreviewVisible}
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Récapitulatif de la commande</Text>
            
            <ScrollView style={styles.modalScrollView}>
              {sortedProducts.map(item => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName}>
                    {item.name}
                  </Text>
                  <Text style={styles.orderItemQuantity}>
                    x {item.quantity}
                  </Text>
                </View>
              ))}
              
              <View style={styles.orderTotal}>
                <Text style={styles.orderTotalLabel}>
                  Total: {getTotalQuantity()} article{getTotalQuantity() > 1 ? 's' : ''}
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsPreviewVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Modifier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmOrder}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectedProduct: {
    backgroundColor: '#f0f9f0',
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D32',
  },
  disabledButton: {
    opacity: 0.5,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#2E7D32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  productsContainer: {
    flex: 1,
    padding: 15,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7f0',
    borderRadius: 20,
    padding: 5,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summary: {
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  validateButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  validateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Styles pour la modale
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2E7D32',
  },
  modalScrollView: {
    maxHeight: '70%',
  },
  orderItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  orderItemDetails: {
    marginTop: 5,
  },
  orderItemQuantity: {
    color: '#666',
    fontSize: 14,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItemTotal: {
    fontWeight: '600',
  },
  orderTotal: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  orderTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  orderTotalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
