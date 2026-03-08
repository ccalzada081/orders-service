import axios from "axios";

const PRODUCTS_BASE_URL = "http://localhost:3001";
const ORDERS_BASE_URL = "http://localhost:3002";

describe("Orders ↔ Products Integration", () => {
  let productId: string;

  test("should create an order and decrease product stock", async () => {
    const createdProductResponse = await axios.post(`${PRODUCTS_BASE_URL}/products`, {
      name: "Integration Test Product",
      price: 100,
      category: "electronics",
      stock: 10,
      image: "https://via.placeholder.com/200"
    });

    expect(createdProductResponse.status).toBe(201);

    productId = createdProductResponse.data.id;

    const productBeforeOrderResponse = await axios.get(
      `${PRODUCTS_BASE_URL}/products/${productId}`
    );

    expect(productBeforeOrderResponse.status).toBe(200);
    expect(productBeforeOrderResponse.data.stock).toBe(10);

    const createdOrderResponse = await axios.post(`${ORDERS_BASE_URL}/orders`, {
      items: [
        {
          productId,
          quantity: 2
        }
      ]
    });

    expect(createdOrderResponse.status).toBe(201);
    expect(createdOrderResponse.data.status).toBe("CONFIRMED");
    expect(createdOrderResponse.data.total).toBe(200);

    const productAfterOrderResponse = await axios.get(
      `${PRODUCTS_BASE_URL}/products/${productId}`
    );

    expect(productAfterOrderResponse.status).toBe(200);
    expect(productAfterOrderResponse.data.stock).toBe(8);
  });
});
