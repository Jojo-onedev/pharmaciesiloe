import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/order_provider.dart';
import '../providers/product_provider.dart';
import '../models/product.dart';
import '../models/order_item.dart';
import 'order_detail_screen.dart';

class OrderCreateScreen extends StatefulWidget {
  const OrderCreateScreen({super.key});

  @override
  State<OrderCreateScreen> createState() => _OrderCreateScreenState();
}

class _OrderCreateScreenState extends State<OrderCreateScreen> {
  final Map<String, int> _selectedProducts = {};
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProducts();
    });
  }

  Future<void> _loadProducts() async {
    try {
      final orderProvider = Provider.of<OrderProvider>(context, listen: false);
      await orderProvider.loadOrders();
      
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Erreur lors du chargement des produits';
        });
      }
    }
  }

  void _updateQuantity(String productId, int quantity) {
    setState(() {
      if (quantity > 0) {
        _selectedProducts[productId] = quantity;
      } else {
        _selectedProducts.remove(productId);
      }
    });
  }

  Future<void> _createOrder() async {
    if (_selectedProducts.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Veuillez sélectionner au moins un produit'),
            backgroundColor: Colors.orange,
          ),
        );
      }
      return;
    }

    try {
      final orderProvider = Provider.of<OrderProvider>(context, listen: false);
      final productProvider = Provider.of<ProductProvider>(context, listen: false);
      
      // Get selected products with quantities
      final selectedProducts = <Product, int>{};
      for (var entry in _selectedProducts.entries) {
        if (entry.value > 0) {
          final product = productProvider.getProductById(entry.key);
          if (product != null) {
            selectedProducts[product] = entry.value;
          }
        }
      }
      
      if (selectedProducts.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Aucun produit valide sélectionné'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }
      
      // Create order items
      final orderItems = selectedProducts.entries.map((entry) {
        return OrderItem(
          productId: entry.key.id,
          productName: entry.key.name,
          quantity: entry.value,
        );
      }).toList();
      
      // Create the order
      final order = await orderProvider.createOrder(orderItems);

      if (mounted) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Commande créée avec succès'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Navigate to order detail
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => OrderDetailScreen(order: order),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la création de la commande'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nouvelle Commande'),
        actions: [
          TextButton(
            onPressed: _createOrder,
            child: const Text('Valider', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : Consumer<ProductProvider>(
                  builder: (context, productProvider, _) {
                    final products = productProvider.products;

                    if (products.isEmpty) {
                      return const Center(
                        child: Text('Aucun produit disponible'),
                      );
                    }

                    // Créer une copie triée de la liste des produits
                    final sortedProducts = List<Product>.from(products)
                      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
                    
                    return Column(
                      children: [
                        Expanded(
                          child: ListView.builder(
                            itemCount: sortedProducts.length,
                            itemBuilder: (context, index) {
                              final product = sortedProducts[index];
                              final quantity = _selectedProducts[product.id] ?? 0;
                              
                              return Card(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 4,
                                ),
                                child: ListTile(
                                  title: Text(product.name),
                                  subtitle: Text(
                                    'Stock: ${product.quantity} unité${product.quantity > 1 ? 's' : ''}',
                                    style: TextStyle(
                                      color: product.quantity == 0
                                          ? Colors.red
                                          : null,
                                    ),
                                  ),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove_circle_outline),
                                        onPressed: quantity > 0
                                            ? () => _updateQuantity(
                                                  product.id, quantity - 1)
                                            : null,
                                      ),
                                      Text(
                                        quantity.toString(),
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.add_circle_outline),
                                        onPressed: quantity < product.quantity
                                            ? () => _updateQuantity(
                                                  product.id, quantity + 1)
                                            : null,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        if (_selectedProducts.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primaryContainer.withAlpha(25),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.blue.withAlpha(25), // ~10% opacity
                                  blurRadius: 8,
                                  offset: const Offset(0, -2),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      'Total des articles :',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      '${_selectedProducts.values.fold(0, (sum, qty) => sum + qty)} articles',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: _createOrder,
                                    style: ElevatedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 16),
                                    ),
                                    child: const Text('Créer la commande'),
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    );
                  },
                ),
    );
  }
}
