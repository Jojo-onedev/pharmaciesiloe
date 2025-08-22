import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/order.dart';
import '../models/order_item.dart';
import '../models/product.dart';

class OrderProvider with ChangeNotifier {
  final List<Order> _orders = [];
  final Uuid _uuid = const Uuid();
  late final Box<Order> _ordersBox;
  bool _isInitialized = false;

  List<Order> get orders {
    if (!_isInitialized) {
      _initialize();
    }
    return List.unmodifiable(_orders);
  }

  Order? getOrderById(String id) {
    try {
      return _orders.firstWhere((order) => order.id == id);
    } catch (e) {
      return null;
    }
  }

  Future<void> _initialize() async {
    if (_isInitialized) return;
    
    _ordersBox = await Hive.openBox<Order>('orders');
    _loadFromHive();
    _isInitialized = true;
  }
  
  void _loadFromHive() {
    _orders.clear();
    _orders.addAll(_ordersBox.values);
    notifyListeners();
  }
  
  Future<void> loadOrders() async {
    await _initialize();
    _loadFromHive();
  }

  Future<Order> createOrder(List<OrderItem> items) async {
    await _initialize();
    final newOrder = Order(
      id: _uuid.v4(),
      date: DateTime.now(),
      items: List.from(items),
    );
    _orders.add(newOrder);
    await _ordersBox.put(newOrder.id, newOrder);
    notifyListeners();
    return newOrder;
  }

  // Create an order from a map of product IDs to quantities
  Future<Order> createOrderFromProductQuantities(Map<String, int> productQuantities, List<Product> products) async {
    await _initialize();
    final orderItems = <OrderItem>[];
    
    productQuantities.forEach((productId, quantity) {
      if (quantity > 0) {
        final product = products.firstWhere((p) => p.id == productId);
        orderItems.add(OrderItem(
          productId: productId,
          productName: product.name,
          quantity: quantity,
        ));
      }
    });

    return createOrder(orderItems);
  }

  // For testing purposes
  void setOrders(List<Order> orders) {
    _orders.clear();
    _orders.addAll(orders);
    notifyListeners();
  }
}
