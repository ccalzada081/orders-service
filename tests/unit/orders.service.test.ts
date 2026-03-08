import { OrdersService } from "../../src/services/orders.service";
import { OrdersRepository } from "../../src/repositories/orders.repository";
import { ProductsClient } from "../../src/clients/products.client";
import type { Order } from "../../src/models/order.model";

jest.mock("../../src/repositories/orders.repository");
jest.mock("../../src/clients/products.client");

describe("OrdersService", () => {
  let service: OrdersService;
  let repositoryMock: jest.Mocked<OrdersRepository>;
  let productsClientMock: jest.Mocked<ProductsClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService();
    repositoryMock = (service as any).repository as jest.Mocked<OrdersRepository>;
    productsClientMock = (service as any).productsClient as jest.Mocked<ProductsClient>;
  });

  test("should throw error if order has no items", async () => {
    await expect(service.createOrder({ items: [] })).rejects.toThrow(
      "Order must contain at least one item"
    );
  });

  test("should throw error if order item is invalid", async () => {
    await expect(
      service.createOrder({
        items: [{ productId: "", quantity: 0 }]
      })
    ).rejects.toThrow("Invalid order item");
  });

  test("should throw error if product is not found", async () => {
    productsClientMock.getProductById.mockRejectedValue(new Error("Product not found: p1"));

    await expect(
      service.createOrder({
        items: [{ productId: "p1", quantity: 2 }]
      })
    ).rejects.toThrow("Product not found: p1");
  });

  test("should create order successfully", async () => {
    productsClientMock.getProductById.mockResolvedValue({
      id: "p1",
      name: "Mouse",
      price: 25,
      category: "electronics",
      stock: 10,
      image: "https://via.placeholder.com/200",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    });

    productsClientMock.decreaseStock.mockResolvedValue({
      id: "p1",
      name: "Mouse",
      price: 25,
      category: "electronics",
      stock: 8,
      image: "https://via.placeholder.com/200",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02"
    });

    repositoryMock.create.mockImplementation(async (order) => order);

    const result = await service.createOrder({
      items: [{ productId: "p1", quantity: 2 }]
    });

    expect(result.total).toBe(50);
    expect(result.status).toBe("CONFIRMED");
    expect(repositoryMock.create).toHaveBeenCalled();
    expect(productsClientMock.decreaseStock).toHaveBeenCalledWith("p1", 2);
  });

  test("should throw error if payment is rejected", async () => {
    jest.spyOn(service as any, "simulatePayment").mockReturnValue(false);

    productsClientMock.getProductById.mockResolvedValue({
      id: "p1",
      name: "Mouse",
      price: 25,
      category: "electronics",
      stock: 10,
      image: "https://via.placeholder.com/200",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    });

    await expect(
      service.createOrder({
        items: [{ productId: "p1", quantity: 2 }]
      })
    ).rejects.toThrow("Payment was rejected");
  });

  test("should throw error if stock is insufficient", async () => {
    productsClientMock.getProductById.mockResolvedValue({
      id: "p1",
      name: "Mouse",
      price: 25,
      category: "electronics",
      stock: 1,
      image: "https://via.placeholder.com/200",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    });

    await expect(
      service.createOrder({
        items: [{ productId: "p1", quantity: 2 }]
      })
    ).rejects.toThrow("Not enough stock for product: p1");
  });

  test("should get order by id", async () => {
    const order: Order = {
      id: "o1",
      items: [{ productId: "p1", quantity: 2, price: 25 }],
      total: 50,
      status: "CONFIRMED",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    };

    repositoryMock.findById.mockResolvedValue(order);

    const result = await service.getOrderById("o1");

    expect(result).toEqual(order);
    expect(repositoryMock.findById).toHaveBeenCalledWith("o1");
  });

  test("should get all orders", async () => {
    const orders: Order[] = [
      {
        id: "o1",
        items: [{ productId: "p1", quantity: 2, price: 25 }],
        total: 50,
        status: "CONFIRMED",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01"
      }
    ];

    repositoryMock.findAll.mockResolvedValue(orders);

    const result = await service.getAllOrders();

    expect(result).toEqual(orders);
    expect(repositoryMock.findAll).toHaveBeenCalled();
  });

  test("should update order status successfully", async () => {
    const order: Order = {
      id: "o1",
      items: [{ productId: "p1", quantity: 2, price: 25 }],
      total: 50,
      status: "CONFIRMED",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    };

    const updatedOrder: Order = {
      ...order,
      status: "PAID",
      updatedAt: "2026-01-02"
    };

    repositoryMock.findById.mockResolvedValue(order);
    repositoryMock.updateStatus.mockResolvedValue(updatedOrder);

    const result = await service.updateOrderStatus("o1", "PAID");

    expect(result.status).toBe("PAID");
    expect(repositoryMock.updateStatus).toHaveBeenCalledWith("o1", "PAID");
  });

  test("should throw error if order does not exist when updating status", async () => {
    repositoryMock.findById.mockResolvedValue(null);

    await expect(service.updateOrderStatus("o1", "PAID")).rejects.toThrow(
      "Order not found"
    );
  });

  test("should throw error if order status is invalid", async () => {
    const order: Order = {
      id: "o1",
      items: [{ productId: "p1", quantity: 2, price: 25 }],
      total: 50,
      status: "CONFIRMED",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01"
    };

    repositoryMock.findById.mockResolvedValue(order);

    await expect(
      service.updateOrderStatus("o1", "INVALID" as any)
    ).rejects.toThrow("Invalid order status");
  });

  test("should throw error if product response is null", async () => {
    productsClientMock.getProductById.mockResolvedValue(null as any);

    await expect(
      service.createOrder({
        items: [{ productId: "p1", quantity: 2 }]
      })
    ).rejects.toThrow("Product not found: p1");
  });
});

