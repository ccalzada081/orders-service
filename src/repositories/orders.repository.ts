import { GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Order, OrderStatus } from "../models/order.model";
import { dynamoDb } from "../utils/dynamodb";

const TABLE_NAME = process.env.ORDERS_TABLE || "Orders";

export class OrdersRepository {
  async create(order: Order): Promise<Order> {
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: order
      })
    );

    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id }
      })
    );

    return (result.Item as Order) || null;
  }

  async findAll(): Promise<Order[]> {
    const result = await dynamoDb.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    );

    return (result.Items as Order[]) || [];
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const result = await dynamoDb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `
          SET #status = :status,
              updatedAt = :updatedAt
        `,
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":status": status,
          ":updatedAt": new Date().toISOString()
        },
        ReturnValues: "ALL_NEW"
      })
    );

    return result.Attributes as Order;
  }
}
