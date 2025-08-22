import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart' as path_provider;

import 'constants/app_constants.dart';
import 'screens/main_screen.dart';
import 'models/product.dart';
import 'models/order.dart';
import 'models/order_item.dart';
import 'providers/product_provider.dart';
import 'providers/order_provider.dart';

Future<void> _initHive() async {
  try {
    // Initialize Hive
    if (!Hive.isAdapterRegistered(0)) Hive.registerAdapter(ProductAdapter());
    if (!Hive.isAdapterRegistered(1)) Hive.registerAdapter(OrderItemAdapter());
    if (!Hive.isAdapterRegistered(2)) Hive.registerAdapter(OrderAdapter());
    
    // Use in-memory storage for web, persistent storage for other platforms
    if (identical(0, 0.0)) { // Hack to check if web
      // Web platform - use in-memory storage
      await Hive.initFlutter();
    } else {
      // Mobile/Desktop - use persistent storage
      final appDocumentDir = await path_provider.getApplicationDocumentsDirectory();
      await Hive.initFlutter(appDocumentDir.path);
    }
    
    // Open Hive boxes with error handling
    await Hive.openBox<Product>('products').catchError((e) {
      debugPrint('Error opening products box: $e');
      return Hive.openBox<Product>('products', bytes: Uint8List(0));
    });
    
    await Hive.openBox<Order>('orders').catchError((e) {
      debugPrint('Error opening orders box: $e');
      return Hive.openBox<Order>('orders', bytes: Uint8List(0));
    });
    
    return;
  } catch (e) {
    debugPrint('Error initializing Hive: $e');
    rethrow;
  }
}

void main() async {
  // Ensure Flutter binding is initialized
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await _initHive();
    runApp(const MyApp());
  } catch (e) {
    // Fallback to non-persistent storage if initialization fails
    debugPrint('Falling back to in-memory storage: $e');
    runApp(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Mode hors ligne - Les données ne seront pas enregistrées'),
          ),
        ),
      ),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
      ],
      child: MaterialApp(
        title: 'Pharmacie Siloé',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const MainScreen(),
      ),
    );
  }
}
