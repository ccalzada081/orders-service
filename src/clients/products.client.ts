import axios from "axios";

const PRODUCTS_BASE_URL = process.env.PRODUCTS_BASE_URL || "http://localhost:3001";

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export class ProductsClient {
  async getProductById(productId: string): Promise<ProductResponse> {
    const response = await axios.get(`${PRODUCTS_BASE_URL}/products/${productId}`);
    return response.data;
  }

  async decreaseStock(productId: string, quantity: number): Promise<ProductResponse> {
    const response = await axios.put(`${PRODUCTS_BASE_URL}/products/${productId}/stock`, {
      quantity
    });

    return response.data;
  }
}
