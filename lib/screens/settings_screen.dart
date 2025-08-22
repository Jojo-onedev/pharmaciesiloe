import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/product_provider.dart';
import '../providers/order_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  Future<void> _clearAllData(BuildContext context) async {
    // Store the context in a local variable to use after async gap
    final currentContext = context;
    
    final confirmed = await showDialog<bool>(
      context: currentContext,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Confirmer la suppression'),
        content: const Text(
            'Voulez-vous vraiment supprimer toutes les données ? Cette action est irréversible.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(true),
            child: const Text(
              'Tout supprimer',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // Check if the widget is still mounted before proceeding
      if (!currentContext.mounted) return;
      
      final productProvider =
          Provider.of<ProductProvider>(currentContext, listen: false);
      final orderProvider = Provider.of<OrderProvider>(currentContext, listen: false);

      // Clear all data
      productProvider.setProducts([]);
      orderProvider.setOrders([]);
      
      // Add a small delay to ensure the UI updates
      await Future.delayed(Duration.zero);

      // Check again if the widget is still mounted before showing the snackbar
      if (currentContext.mounted) {
        ScaffoldMessenger.of(currentContext).showSnackBar(
          const SnackBar(
            content: Text('Toutes les données ont été supprimées'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Paramètres'),
      ),
      body: ListView(
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Application',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('À propos'),
            subtitle: const Text('Version 1.0.0'),
            onTap: () {
              showAboutDialog(
                context: context,
                applicationName: 'Pharmacie Siloé',
                applicationVersion: '1.0.0',
                applicationIcon: const Icon(
                  Icons.local_pharmacy,
                  size: 50,
                  color: Colors.green,
                ),
                children: const [
                  SizedBox(height: 16),
                  Text('Application de gestion pour la Pharmacie Siloé'),
                ],
              );
            },
          ),
          const Divider(),
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Données',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ),
          Consumer2<ProductProvider, OrderProvider>(
            builder: (context, productProvider, orderProvider, _) {
              final productCount = productProvider.products.length;
              final orderCount = orderProvider.orders.length;
              
              return Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.inventory_2_outlined),
                    title: const Text('Produits enregistrés'),
                    trailing: Text('$productCount'),
                  ),
                  ListTile(
                    leading: const Icon(Icons.receipt_long_outlined),
                    title: const Text('Commandes enregistrées'),
                    trailing: Text('$orderCount'),
                  ),
                ],
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.delete_forever, color: Colors.red),
            title: const Text(
              'Réinitialiser toutes les données',
              style: TextStyle(color: Colors.red),
            ),
            onTap: () => _clearAllData(context),
          ),
          const SizedBox(height: 32),
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Développé avec ❤️ pour la Pharmacie Siloé',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
