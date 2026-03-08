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
```

---

## Environment Variables

Create a `.env` file in the root of the project.

```env
PORT=3002
AWS_REGION=us-east-1
ORDERS_TABLE=Orders
PRODUCTS_BASE_URL=http://localhost:3001
```

---

## DynamoDB Table

### Table name

```
Orders
```

### Partition key

```
id (String)
```

---

## Order Model

```json
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
```

---

## Installation

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Run compiled version:

```bash
npm start
```

---

## API Endpoints

### Health Check

```
GET /health
```

---

### Create Order

```
POST /orders
```

Creates a new order after validating stock with the Products Service.

---

### Get All Orders

```
GET /orders
```

Returns all orders stored in the database.

---

### Get Order by ID

```
GET /orders/:id
```

Returns a single order by its ID.

Example:

```
GET /orders/7411fd9c-6227-4bed-a99d-b98c1d9e220a
```

---

### Update Order Status

```
PUT /orders/:id/status
```

Request body:

```json
{
  "status": "PAID"
}
```

---

## Order Statuses

Supported statuses:

- PENDING
- CONFIRMED
- PAID
- CANCELLED

### Typical Order Flow

```
Order created → CONFIRMED → PAID
```

---

## Integration with Products Service

Orders Service communicates with **Products Service** via REST API.

### Validate Stock

```
GET /products/:id
```

This call retrieves product details and verifies if enough stock is available.

---

### Decrease Stock

```
PUT /products/:id/stock
```

Request body:

```json
{
  "quantity": 2
}
```

This endpoint is called after order confirmation to update inventory.

---

## Example Requests

### Create Order

```
POST /orders
```

```json
{
  "items": [
    {
      "productId": "real-product-id",
      "quantity": 2
    }
  ]
}
```

---

### Update Order Status

```
PUT /orders/:id/status
```

```json
{
  "status": "PAID"
}
```

---

## Error Handling

Examples of handled errors:

- invalid order data
- product not found
- insufficient stock
- invalid order status
- payment rejected

Example error response:

```json
{
  "error": "OUT_OF_STOCK",
  "message": "Not enough stock for product: p1"
}
```

---

## Testing

Run unit tests with coverage:

```bash
npm test
```

### Coverage

- Statements: **80%+**
- Lines: **80%+**

The service meets the required **80% unit test coverage**.

---

## Docker

Build Docker image:

```bash
docker build -t orders-service .
```

Run container:

```bash
docker run -p 3002:3002 orders-service
```

---

## Postman Collection

A Postman collection is included in the repository:

```
Orders Service API.postman_collection.json
```

It contains:

- valid order creation
- order retrieval
- order status update
- invalid item scenario
- out of stock scenario

---

## Notes

Orders Service depends on **Products Service**.

Products Service must be running for order creation to work locally.

This service demonstrates **microservice-to-microservice communication using REST**.
