import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Card, Text, TextInput, Divider } from 'react-native-paper';
import { useAppContext } from '../../context/AppContext';

const OrderScreen = ({ navigation }) => {
  const { products, orderItems, addToOrder, updateOrderItem, removeFromOrder, clearOrder } = useAppContext();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, value) => {
    // S'assurer que la valeur est un nombre positif ou vide
    if (value === '' || /^\d+$/.test(value)) {
      setQuantities(prev => ({
        ...prev,
        [productId]: value === '' ? '' : parseInt(value, 10)
      }));
    }
  };

  const handleAddToOrder = (productId) => {
    const quantity = quantities[productId] || 0;
    if (quantity > 0) {
      addToOrder(productId, quantity);
      setQuantities(prev => ({
        ...prev,
        [productId]: ''
      }));
    }
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    updateOrderItem(productId, newQuantity);
  };

  const getProductById = (id) => products.find(p => p.id === id);

  const renderProductItem = ({ item: product }) => {
    const orderItem = orderItems.find(oi => oi.productId === product.id);
    const quantity = quantities[product.id] || '';

    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.productName}>{product.name}</Text>
          <View style={styles.quantityContainer}>
            <TextInput
              mode="outlined"
              style={styles.quantityInput}
              keyboardType="numeric"
              value={quantity.toString()}
              onChangeText={(text) => handleQuantityChange(product.id, text)}
              placeholder="0"
              dense
            />
            <Button
              mode="contained"
              onPress={() => handleAddToOrder(product.id)}
              style={styles.addButton}
              disabled={!quantity || quantity <= 0}
              compact
            >
              Ajouter
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderOrderItem = ({ item }) => {
    const product = getProductById(item.productId);
    if (!product) return null;

    return (
      <View style={styles.orderItem}>
        <Text style={styles.orderProductName}>{product.name}</Text>
        <View style={styles.orderItemActions}>
          <Button
            icon="minus"
            mode="outlined"
            onPress={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
            style={styles.quantityButton}
            compact
          />
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Button
            icon="plus"
            mode="outlined"
            onPress={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
            style={styles.quantityButton}
            compact
          />
          <Button
            icon="delete"
            mode="outlined"
            onPress={() => removeFromOrder(item.productId)}
            style={styles.deleteButton}
            textColor="#D32F2F"
            compact
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Produits disponibles</Text>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>Aucun produit disponible</Text>
          </View>
        }
      />

      <Divider style={styles.divider} />

      <View style={styles.orderSection}>
        <View style={styles.orderHeader}>
          <Text variant="titleLarge">Commande en cours</Text>
          {orderItems.length > 0 && (
            <Button
              onPress={() => clearOrder()}
              textColor="#D32F2F"
              compact
            >
              Vider
            </Button>
          )}
        </View>

        {orderItems.length > 0 ? (
          <FlatList
            data={orderItems}
            renderItem={renderOrderItem}
            keyExtractor={item => item.productId}
            contentContainerStyle={styles.orderList}
          />
        ) : (
          <View style={styles.emptyOrderContainer}>
            <Text>Aucun article dans la commande</Text>
          </View>
        )}

        {orderItems.length > 0 && (
          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Pdf')}
              style={styles.generateButton}
              icon="file-pdf"
            >
              Générer le PDF
            </Button>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  productList: {
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  productName: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 60,
    height: 40,
    marginRight: 10,
    textAlign: 'center',
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#2E7D32',
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#BDBDBD',
  },
  orderSection: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderList: {
    paddingBottom: 70, // Pour laisser de l'espace pour le bouton en bas
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 8,
    borderRadius: 4,
    elevation: 1,
  },
  orderProductName: {
    flex: 1,
  },
  orderItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    marginHorizontal: 4,
  },
  quantityText: {
    minWidth: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 8,
    borderColor: '#D32F2F',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyOrderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 4,
  },
  generateButton: {
    backgroundColor: '#2E7D32',
  },
});

export default OrderScreen;
