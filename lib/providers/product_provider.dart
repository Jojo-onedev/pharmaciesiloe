import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/product.dart';

class ProductProvider with ChangeNotifier {
  final List<Product> _products = [];
  final Uuid _uuid = const Uuid();
  late final Box<Product> _productsBox;
  bool _isInitialized = false;

  List<Product> get products => List.unmodifiable(_products);
  
  bool get isInitialized => _isInitialized;

  Product? getProductById(String id) {
    try {
      return _products.firstWhere((product) => product.id == id);
    } catch (e) {
      return null;
    }
  }

  Future<void> _initialize() async {
    if (_isInitialized) return;
    
    try {
      _productsBox = await Hive.openBox<Product>('products');
      await _loadFromHive();
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error initializing ProductProvider: $e');
      rethrow;
    }
  }
  
  Future<void> _loadFromHive() async {
    _products.clear();
    _products.addAll(_productsBox.values);
    // No more sample data - start with an empty list
    notifyListeners();
  }
  
  Future<void> loadProducts() async {
    await _initialize();
    _loadFromHive();
  }

  Future<void> addProduct(Product product) async {
    await _initialize();
    final newProduct = product.copyWith(id: _uuid.v4());
    _products.add(newProduct);
    await _productsBox.put(newProduct.id, newProduct);
    notifyListeners();
  }

  Future<void> updateProduct(Product updatedProduct) async {
    await _initialize();
    final index = _products.indexWhere((p) => p.id == updatedProduct.id);
    if (index >= 0) {
      _products[index] = updatedProduct;
      await _productsBox.put(updatedProduct.id, updatedProduct);
      notifyListeners();
    }
  }

  Future<void> deleteProduct(String id) async {
    await _initialize();
    _products.removeWhere((product) => product.id == id);
    await _productsBox.delete(id);
    notifyListeners();
  }

  // For testing purposes
  void setProducts(List<Product> products) {
    _products.clear();
    _products.addAll(products);
    notifyListeners();
  }
}
