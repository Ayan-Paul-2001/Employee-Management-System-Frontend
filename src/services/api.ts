import api from '../lib/axios';

// Base API service with common methods
export class BaseApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll() {
    try {
      const response = await api.get(this.endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}:`, error);
      throw error;
    }
  }

  async getById(id: number | string) {
    try {
      const response = await api.get(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const response = await api.post(this.endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error creating ${this.endpoint}:`, error);
      throw error;
    }
  }

  async update(id: number | string, data: any) {
    try {
      const response = await api.patch(`${this.endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }

  async delete(id: number | string) {
    try {
      const response = await api.delete(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}/${id}:`, error);
      throw error;
    }
  }
}