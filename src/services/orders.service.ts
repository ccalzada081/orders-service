import { randomUUID } from "crypto";
import type { Order, OrderItem, OrderStatus } from "../models/order.model";
import { OrdersRepository } from "../repositories/orders.repository";
import { ProductsClient } from "../clients/products.client";

interface CreateOrderInput {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export class OrdersService {
  private repository: OrdersRepository;
  private productsClient: ProductsClient;

  constructor() {
    this.repository = new OrdersRepository();
    this.productsClient = new ProductsClient();
  }

  async createOrder(input: CreateOrderInput): Promise<Order> {
    if (!input.items || input.items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const item of input.items) {
      if (!item.productId || item.quantity == null || item.quantity <= 0) {
        throw new Error("Invalid order item");
      }

      const product = await this.productsClient.getProductById(item.productId);

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for product: ${item.productId}`);
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      });

      total += product.price * item.quantity;
    }

    const paymentApproved = this.simulatePayment();

    if (!paymentApproved) {
      throw new Error("Payment was rejected");
    }

    for (const item of input.items) {
      await this.productsClient.decreaseStock(item.productId, item.quantity);
    }

    const now = new Date().toISOString();

    const order: Order = {
      id: randomUUID(),
      items: orderItems,
      total,
      status: "CONFIRMED",
      createdAt: now,
      updatedAt: now
    };

    return this.repository.create(order);
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.repository.findById(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.repository.findAll();
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const existingOrder = await this.repository.findById(id);

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    const allowedStatuses: OrderStatus[] = ["PENDING", "CONFIRMED", "PAID", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid order status");
    }

    return this.repository.updateStatus(id, status);
  }

  private simulatePayment(): boolean {
    return true;
  }
}
