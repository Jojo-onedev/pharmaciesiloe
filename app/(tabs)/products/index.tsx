import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../../context/AppContext';
import { ToastAndroid } from 'react-native';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
};

// Données temporaires pour les catégories (à remplacer par vos données réelles)
const categories = [
  { id: '1', name: 'Tous', icon: 'grid' },
  { id: '2', name: 'Médicaments', icon: 'medkit' },
  { id: '3', name: 'Soins', icon: 'bandage' },
  { id: '4', name: 'Bébé', icon: 'happy' },
  { id: '5', name: 'Hygiène', icon: 'water' },
  { id: '6', name: 'Vitamines', icon: 'flask' },
];

export default function ProductsScreen() {
  const { products, addToOrder, addProduct, updateProduct, deleteProduct } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('1');
  
  // États pour les modales
  const [isAddModalVisible, setIsAddModalVisible] = React.useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    price: '',
    category: ''
  });

  // Filtrer et trier les produits par recherche, catégorie et ordre alphabétique
  const filteredProducts = React.useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === '1' || 
                              product.category === categories.find(c => c.id === selectedCategory)?.name;
        
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', {sensitivity: 'base'}));
  }, [products, searchQuery, selectedCategory]);

  // Gérer l'ajout au panier
  const handleAddToCart = (e: any, productId: string) => {
    e.stopPropagation(); // Empêcher la propagation de l'événement
    addToOrder(productId, 1);
    ToastAndroid.showWithGravity(
      'Produit ajouté au panier',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  };

  // Gérer le changement des champs du formulaire
  const handleInputChange = (field: string, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer l'édition d'un produit
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category || ''
    });
    setIsEditModalVisible(true);
  };

  // Confirmer la suppression d'un produit
  const confirmDelete = (productId: string) => {
    Alert.alert(
      'Supprimer le produit',
      'Êtes-vous sûr de vouloir supprimer ce produit ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteProduct(productId);
            ToastAndroid.showWithGravity(
              'Produit supprimé',
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM
            );
          },
        },
      ]
    );
  };

  // Fonction pour gérer l'ajout d'un produit
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      ToastAndroid.showWithGravity(
        'Veuillez remplir tous les champs',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      return;
    }

    const productToAdd = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: 1,
      id: Date.now().toString(),
      image: 'https://via.placeholder.com/150'
    };

    addProduct(productToAdd);
    
    // Réinitialiser le formulaire
    setNewProduct({
      name: '',
      price: '',
      category: ''
    });
    
    // Fermer la modale
    setIsAddModalVisible(false);
    
    ToastAndroid.showWithGravity(
      'Produit ajouté avec succès',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  };

  // Soumettre le formulaire d'ajout/édition de produit
  const handleSubmitProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      ToastAndroid.showWithGravity(
        'Veuillez remplir tous les champs',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      return;
    }

    // S'assurer que la catégorie est définie
    const category = newProduct.category || 'Médicaments';

    const productData = {
      name: newProduct.name.trim(),
      price: parseFloat(newProduct.price),
      category: category,
      image: 'https://via.placeholder.com/150', // Image par défaut
      stock: 1
    };

    if (editingProduct) {
      // Mise à jour du produit existant
      updateProduct(editingProduct.id, productData);
      setIsEditModalVisible(false);
      ToastAndroid.showWithGravity(
        'Produit mis à jour',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      // Ajout d'un nouveau produit
      const productToAdd = {
        ...productData,
        stock: 1, // Quantité fixe à 1
        id: Date.now().toString()
      };
      addProduct(productToAdd);
      setIsAddModalVisible(false);
      ToastAndroid.showWithGravity(
        'Produit ajouté avec succès',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
    
    // Réinitialiser le formulaire
    setNewProduct({
      name: '',
      price: '',
      category: ''
    });
    setEditingProduct(null);
  };

  // Gérer la navigation vers le détail du produit
  const handleProductPress = (productId: string) => {
    // À implémenter: Navigation vers l'écran de détail du produit
    console.log('Voir le produit:', productId);
  };

  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>Nos Produits</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add-circle" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filtres de catégorie */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity 
            style={[styles.categoryItem, selectedCategory === category.id && styles.categoryItemSelected]}
            onPress={() => setSelectedCategory(category.id)}
            key={category.id}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={category.icon as any} 
              size={20} 
              color={selectedCategory === category.id ? '#fff' : '#2E7D32'} 
            />
            <Text 
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste des produits */}
      <ScrollView style={styles.productsContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={40} color="#ccc" />
              <Ionicons name="close-circle" size={20} color="#f44336" style={styles.noResultsIcon} />
            </View>
            <Text style={styles.emptyStateText}>Aucun produit trouvé</Text>
            <Text style={styles.emptyStateSubtext}>Essayez de modifier vos critères de recherche</Text>
          </View>
        ) : (
          <View style={styles.productsList}>
            {filteredProducts.map(product => (
              <View key={product.id} style={styles.productItem}>
                <View style={styles.productImageContainer}>
                  <Image 
                    source={{ uri: product.image || 'https://via.placeholder.com/150' }} 
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productCategory}>
                      {product.category}
                    </Text>
                  </View>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                      {formatPrice(product.price)}
                    </Text>
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditProduct(product)}
                      >
                        <Ionicons name="create-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => confirmDelete(product.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modale d'ajout de produit */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un produit</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom du produit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Doliprane 1000mg"
                  value={newProduct.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prix (XOF)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1500"
                  keyboardType="numeric"
                  value={newProduct.price}
                  onChangeText={(text) => handleInputChange('price', text.replace(/[^0-9]/g, ''))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <View style={styles.categorySelector}>
                  {categories.filter(cat => cat.id !== '1').map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        newProduct.category === category.name && styles.categoryOptionSelected
                      ]}
                      onPress={() => handleInputChange('category', category.name)}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={newProduct.category === category.name ? '#fff' : '#2E7D32'} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText,
                          newProduct.category === category.name && styles.categoryOptionTextSelected
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddProduct}
              >
                <Text style={styles.submitButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modale d'édition de produit */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => {
          setIsEditModalVisible(false);
          setEditingProduct(null);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le produit</Text>
              <TouchableOpacity onPress={() => {
                setIsEditModalVisible(false);
                setEditingProduct(null);
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom du produit</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Doliprane 1000mg"
                  value={newProduct.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prix (XOF)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 1500"
                  keyboardType="numeric"
                  value={newProduct.price}
                  onChangeText={(text) => handleInputChange('price', text.replace(/[^0-9]/g, ''))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Catégorie</Text>
                <View style={styles.categorySelector}>
                  {categories.filter(cat => cat.id !== '1').map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        newProduct.category === category.name && styles.categoryOptionSelected
                      ]}
                      onPress={() => handleInputChange('category', category.name)}
                    >
                      <Ionicons 
                        name={category.icon as any} 
                        size={20} 
                        color={newProduct.category === category.name ? '#fff' : '#2E7D32'} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText,
                          newProduct.category === category.name && styles.categoryOptionTextSelected
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditModalVisible(false);
                  setEditingProduct(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitProduct}
              >
                <Text style={styles.submitButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 40,  
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addButton: {
    backgroundColor: '#f0f0f0',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#333',
    fontSize: 15,
  },
  categoriesContainer: {
    marginBottom: 15,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryItemSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  categoryText: {
    marginLeft: 5,
    color: '#2E7D32',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  productsList: {
    padding: 10,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 10,
  },
  productImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  productHeader: {
    flex: 1,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#1976D2',
  },
  deleteButton: {
    backgroundColor: '#D32F2F',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  // Styles pour la modale
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryOptionSelected: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  categoryOptionText: {
    marginLeft: 5,
    color: '#2E7D32',
    fontSize: 12,
  },
  categoryOptionTextSelected: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
  },
  modalButton: {
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  searchIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  noResultsIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
