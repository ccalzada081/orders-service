# Orders Service

Orders Service is the microservice responsible for managing customer orders.

It creates orders, validates stock by calling Products Service, simulates payment processing, updates product stock, and manages order statuses.

---

## Tech Stack

- Node.js
- TypeScript
- Express
- DynamoDB
- AWS SDK v3
- Axios
- Jest
- Docker
- Postman

---

## Responsibilities

This microservice is responsible for:

- Creating orders
- Listing orders
- Getting an order by ID
- Updating order status
- Calling Products Service to validate stock
- Calling Products Service to decrease stock
- Simulating payment approval
- Managing order state transitions

---

## Project Structure

```bash
orders-service
├── src
│   ├── clients
│   ├── models
│   ├── repositories
│   ├── services
│   ├── utils
│   └── app.ts
├── tests
│   └── unit
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── Orders Service API.postman_collection.json
Environment Variables

Create a .env file in the root of the project:

PORT=3002
AWS_REGION=us-east-1
ORDERS_TABLE=Orders
PRODUCTS_BASE_URL=http://localhost:3001
DynamoDB Table
Table name
Orders
Partition key
id (String)
Order model
{
  "id": "uuid",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "price": 25
    }
  ],
  "total": 50,
  "status": "CONFIRMED",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
Installation

Install dependencies:

npm install

Run in development mode:

npm run dev

Build project:

npm run build

Run compiled version:

npm start
API Endpoints
Health check
GET /health
Create order
POST /orders
Get all orders
GET /orders
Get order by ID
GET /orders/:id
Update order status
PUT /orders/:id/status
Order Statuses

Supported statuses:

PENDING
CONFIRMED
PAID
CANCELLED

Typical flow:

Order created → CONFIRMED → PAID
Integration with Products Service

Orders Service communicates with Products Service via REST API.

Validate stock
GET /products/:id
Decrease stock
PUT /products/:id/stock

Request body:

{
  "quantity": 2
}
Example Request
Create order
POST /orders
{
  "items": [
    {
      "productId": "real-product-id",
      "quantity": 2
    }
  ]
}
Update order status
PUT /orders/:id/status
{
  "status": "PAID"
}
Error Handling

Examples of handled errors:

invalid order data

product not found

insufficient stock

invalid order status

payment rejected

Example response:

{
  "error": "OUT_OF_STOCK",
  "message": "Not enough stock for product: p1"
}
Testing

Run unit tests with coverage:

npm test
Coverage

Statements: 80%+

Lines: 80%+

The service meets the required 80% unit test coverage.

Docker

Build Docker image:

docker build -t orders-service .

Run container:

docker run -p 3002:3002 orders-service
Postman Collection

A Postman collection is included in the repository:

Orders Service API.postman_collection.json

It contains:

valid order creation

order retrieval

order status update

invalid item scenario

out of stock scenario

Notes

Orders Service depends on Products Service.

Products Service must be running for order creation to work locally.

This service demonstrates microservice-to-microservice communication using REST.
