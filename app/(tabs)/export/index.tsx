import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Order, OrderItemWithDetails } from '../../../types';

import { useAppContext } from '../../../context/AppContext';

export default function ExportScreen() {
  const { orders } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filtrer les commandes par recherche
  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      // Vérifier si l'ID de commande ou la date correspond à la recherche
      return (
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(order.date).toLocaleDateString('fr-FR').includes(searchQuery)
      );
    });
  }, [orders, searchQuery]);
  
  // Trier les commandes par date (du plus récent au plus ancien)
  const sortedOrders = [...orders].sort((a: Order, b: Order) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleExportOrder = (orderId: string) => {
    // Rediriger vers l'écran de détail avec un paramètre pour déclencher l'export
    router.push({
      pathname: `/export/${orderId}`,
      params: { autoExport: 'true' }
    });
  };

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Aucune commande enregistrée</Text>
        <Text style={styles.emptySubtext}>Les commandes validées apparaîtront ici</Text>
      </View>
    );
  }

  const handleOrderPress = (orderId: string) => {
    router.push(`/export/${orderId}`);
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec titre et barre de recherche */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Historique des Commandes</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une commande..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.ordersList} contentContainerStyle={styles.ordersListContent}>
        {sortedOrders.map((order: Order) => {
          // Vérifier si order.items est défini avant d'utiliser slice
          const itemsToShow = order.items ? order.items.slice(0, 3) : [];
          
          return (
            <View style={styles.orderCard} key={order.id}>
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => handleOrderPress(order.id)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderDate}>{formatDate(order.date.toString())}</Text>
                  <Text style={styles.orderTotal}>
                    {order.totalItems} article{order.totalItems !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                <View style={styles.orderItems}>
                  {itemsToShow.map((item: OrderItemWithDetails, index: number) => (
                    <View key={`${order.id}-${index}`} style={styles.orderItem}>
                      <Text style={styles.orderItemName} numberOfLines={1}>
                        {item.productName}
                      </Text>
                      <Text style={styles.orderItemQuantity}>
                        x{item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.exportButton}
                onPress={() => handleExportOrder(order.id)}
              >
                <Ionicons name="download-outline" size={20} color="#2E7D32" />
                <Text style={styles.exportButtonText}>Exporter</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 40,  // Augmenté de 16 à 40 pour plus d'espace en haut
    paddingBottom: 20,  // Augmenté de 12 à 20 pour plus d'espace en bas
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  headerContent: {
    marginBottom: 16,  // Augmenté de 12 à 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    padding: 16,
    paddingTop: 8,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginRight: 8,
  },
  orderItemQuantity: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  exportButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 8,
  },
});
