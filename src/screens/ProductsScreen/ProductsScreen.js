import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TextInput } from 'react-native';
import { Button, Card, IconButton, Text, Dialog, Portal, Provider as PaperProvider } from 'react-native-paper';
import { useAppContext } from '../../context/AppContext';

const ProductsScreen = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [productName, setProductName] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [visible, setVisible] = useState(false);

  const showDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setEditName(product.name);
    } else {
      setProductName('');
    }
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setEditingProduct(null);
    setEditName('');
  };

  const handleAddProduct = () => {
    if (productName.trim()) {
      addProduct(productName);
      setProductName('');
      hideDialog();
    }
  };

  const handleUpdateProduct = () => {
    if (editName.trim() && editingProduct) {
      updateProduct(editingProduct.id, editName);
      hideDialog();
    }
  };

  const confirmDelete = (product) => {
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${product.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', onPress: () => deleteProduct(product.id), style: 'destructive' },
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <Text variant="titleMedium" style={styles.productName}>{item.name}</Text>
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => showDialog(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={() => confirmDelete(item)}
            iconColor="#D32F2F"
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>Aucun produit pour le moment</Text>
            </View>
          }
        />

        <Button
          mode="contained"
          onPress={() => showDialog()}
          style={styles.addButton}
          icon="plus"
        >
          Ajouter un produit
        </Button>

        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                style={styles.input}
                value={editingProduct ? editName : productName}
                onChangeText={text => 
                  editingProduct ? setEditName(text) : setProductName(text)
                }
                placeholder="Nom du produit"
                autoFocus
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Annuler</Button>
              <Button
                onPress={editingProduct ? handleUpdateProduct : handleAddProduct}
                disabled={!productName.trim() && !editName.trim()}
              >
                {editingProduct ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 0,
  },
  productName: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  addButton: {
    margin: 16,
    backgroundColor: '#2E7D32',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default ProductsScreen;
