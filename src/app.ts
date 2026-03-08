import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OrdersService } from "./services/orders.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const ordersService = new OrdersService();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    service: "orders-service",
    status: "ok"
  });
});

app.post("/orders", async (req, res) => {
  try {
    const order = await ordersService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      message === "Order must contain at least one item" ||
      message === "Invalid order item" ||
      message === "Payment was rejected"
    ) {
      return res.status(400).json({
        error: "INVALID_ORDER",
        message
      });
    }

    if (message.includes("Not enough stock")) {
      return res.status(400).json({
        error: "OUT_OF_STOCK",
        message
      });
    }

    if (message.includes("Product not found")) {
      return res.status(404).json({
        error: "PRODUCT_NOT_FOUND",
        message
      });
    }

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message
    });
  }
});

app.get("/orders", async (_req, res) => {
  try {
    const orders = await ordersService.getAllOrders();
    res.status(200).json({
      items: orders,
      count: orders.length
    });
  } catch (_error) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch orders"
    });
  }
});

app.get("/orders/:id", async (req, res) => {
  try {
    const order = await ordersService.getOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Order not found"
      });
    }

    res.status(200).json(order);
  } catch (_error) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to fetch order"
    });
  }
});

app.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await ordersService.updateOrderStatus(req.params.id, status);

    res.status(200).json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Order not found") {
      return res.status(404).json({
        error: "NOT_FOUND",
        message
      });
    }

    if (message === "Invalid order status") {
      return res.status(400).json({
        error: "INVALID_STATUS",
        message
      });
    }

    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Orders service running on port ${PORT}`);
});

