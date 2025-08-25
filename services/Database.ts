import * as SQLite from 'expo-sqlite';
import { Product, Order, OrderItem } from '../types';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private dbName = 'pharmacie_siloe.db';

  // Get database instance with initialization check
  private async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Initialize the database
  public async initDB(): Promise<SQLite.SQLiteDatabase> {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    try {
      // Close existing connection if any
      if (this.db) {
        await this.db.closeAsync();
      }

      // Open new connection
      const db = await SQLite.openDatabaseAsync(this.dbName);
      this.db = db;
      await this.createTables();
      this.isInitialized = true;
      console.log('Database initialized successfully');
      return db;
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // Création des tables
  private async createTables(): Promise<void> {
    const db = await this.getDatabase();
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        image TEXT,
        category TEXT
      );
      
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY NOT NULL,
        customerName TEXT,
        total REAL NOT NULL,
        date TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT NOT NULL,
        productId TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        productName TEXT NOT NULL,
        productPrice REAL NOT NULL,
        productImage TEXT,
        productCategory TEXT NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products (id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
      CREATE INDEX IF NOT EXISTS idx_order_items_productId ON order_items(productId);
    `);
    
    console.log('Database tables created successfully');
  }

  // Méthodes pour les produits
  public async getProducts(): Promise<Product[]> {
    try {
      const db = await this.getDatabase();
      const results = await db.getAllAsync('SELECT * FROM products');
      return results as Product[];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  public async addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    const db = await this.getDatabase();
    const id = product.id || Date.now().toString();
    const newProduct = {
      ...product,
      id,
    };

    await db.runAsync(
      'INSERT INTO products (id, name, price, stock, image, category) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id, 
        product.name, 
        product.price, 
        product.stock, 
        product.image || '', 
        product.category || 'Médicaments'
      ]
    );

    return newProduct as Product;
  }

  public async updateProduct(product: Product): Promise<void> {
    const db = await this.getDatabase();
    await db.runAsync(
      'UPDATE products SET name = ?, price = ?, stock = ?, image = ?, category = ? WHERE id = ?',
      [
        product.name, 
        product.price, 
        product.stock, 
        product.image || '', 
        product.category || 'Médicaments', 
        product.id
      ]
    );
  }

  // Méthodes pour les commandes
  public async addOrder(order: Omit<Order, 'id' | 'date'>): Promise<Order> {
    const db = await this.getDatabase();
    
    try {
      await db.execAsync('BEGIN TRANSACTION');
      
      const id = Date.now().toString();
      const date = new Date().toISOString();
      
      // Insérer la commande principale
      await db.runAsync(
        'INSERT INTO orders (id, customerName, total, date) VALUES (?, ?, ?, ?)',
        [id, order.customerName || '', order.total, date]
      );

      // Ajouter les articles de la commande
      for (const item of order.items) {
        await db.runAsync(
          `INSERT INTO order_items 
           (orderId, productId, quantity, productName, productPrice, productImage, productCategory) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id, 
            item.productId, 
            item.quantity,
            item.productName,
            item.productPrice,
            item.productImage || null,
            item.productCategory
          ]
        );
      }
      
      await db.execAsync('COMMIT');
      
      return {
        ...order,
        id,
        date: new Date(date),
      };
    } catch (error) {
      await db.execAsync('ROLLBACK');
      console.error('Error adding order:', error);
      throw error;
    }
  }

  public async getOrders(): Promise<Order[]> {
    try {
      const db = await this.getDatabase();
      
      // Define types for raw database rows
      interface OrderRow {
        id: string;
        customerName: string | null;
        total: number;
        date: string;
      }

      interface OrderItemRow {
        id: number;
        orderId: string;
        productId: string;
        quantity: number;
        productName: string;
        productPrice: number;
        productImage: string | null;
        productCategory: string;
      }
      
      // Récupérer toutes les commandes
      const ordersData = await db.getAllAsync<OrderRow>('SELECT * FROM orders ORDER BY date DESC');
      
      const orders: Order[] = [];

      // Pour chaque commande, récupérer les articles associés
      for (const order of ordersData) {
        const itemsData = await db.getAllAsync<OrderItemRow>(
          'SELECT * FROM order_items WHERE orderId = ?',
          [order.id]
        );

        const items: OrderItem[] = itemsData.map(item => ({
          id: item.id.toString(),
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage || undefined,
          productCategory: item.productCategory
        }));

        orders.push({
          id: order.id,
          customerName: order.customerName || undefined,
          total: order.total,
          date: new Date(order.date),
          items,
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
        });
      }

      return orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Méthode pour fermer la base de données
  public async closeDatabase(): Promise<void> {
    if (this.db) {
      try {
        await this.db.closeAsync();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database:', error);
      } finally {
        this.db = null;
        this.isInitialized = false;
      }
    }
  }
}

export default new Database();
