import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'product.g.dart';

@HiveType(typeId: 0)
class Product extends HiveObject {
  @HiveField(0)
  late String id;
  
  @HiveField(1)
  late String name;
  
  @HiveField(2)
  String? description;
  
  @HiveField(3)
  late int quantity;

  Product({
    String? id,
    required this.name,
    this.description,
    required this.quantity,
  }) : id = id ?? const Uuid().v4();
      
  // Constructor with all required fields
  Product.create({
    required this.id,
    required this.name,
    this.description,
    required this.quantity,
  });

  // Create a Product from JSON
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      quantity: json['quantity'],
    );
  }

  // Convert a Product to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'quantity': quantity,
    };
  }

  // Create a copy of the product with some updated values
  Product copyWith({
    String? id,
    String? name,
    String? description,
    int? quantity,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      quantity: quantity ?? this.quantity,
    );
  }
}
