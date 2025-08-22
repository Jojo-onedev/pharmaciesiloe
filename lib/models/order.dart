import 'package:hive/hive.dart';
import 'package:intl/intl.dart';
import 'order_item.dart';

part 'order.g.dart';

@HiveType(typeId: 2)
class Order extends HiveObject {
  @HiveField(0)
  late String id;
  
  @HiveField(1)
  late DateTime date;
  
  @HiveField(2)
  late List<OrderItem> items;

  Order({
    required this.id,
    required this.date,
    required this.items,
  });

  // Get the total number of items in the order
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);

  // Format the date as DD/MM/YYYY
  String get formattedDate => DateFormat('dd/MM/yyyy').format(date);

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      date: DateTime.parse(json['date']),
      items: (json['items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date.toIso8601String(),
      'items': items.map((item) => item.toJson()).toList(),
    };
  }
}
