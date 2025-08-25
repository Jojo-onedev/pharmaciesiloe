export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
};

export type OrderItem = {
  id?: string; // ID temporaire pour les articles non enregistrés
  orderId: string;
  productId: string;
  quantity: number;
  productName: string;
  productPrice: number;
  productImage?: string;
  productCategory: string;
};

export type OrderItemWithDetails = OrderItem & {
  productName: string;
  productPrice: number;
  productImage?: string;
  productCategory: string;
};

export type Order = {
  id: string;
  customerName?: string;
  total: number;
  date: Date;
  items: OrderItemWithDetails[];
  totalItems: number;
};

export type AppContextType = {
  products: Product[];
  orderItems: OrderItem[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => void;
  deleteProduct: (id: string) => void;
  addToOrder: (productId: string, quantity: number) => void;
  updateOrderItem: (productId: string, quantity: number) => void;
  removeFromOrder: (productId: string) => void;
  clearOrder: () => void;
  addOrder: (order: Omit<Order, 'id' | 'date'>) => Promise<Order>;
};
