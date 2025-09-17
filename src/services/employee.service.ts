import { BaseApiService } from './api';
import api from '../lib/axios';

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  status: string;
  contactNumber?: string;
  address?: string;
}

export class EmployeeService extends BaseApiService {
  constructor() {
    super('/employees');
  }
  
  async getEmployeeIdByUserId(userId: number): Promise<number> {
    try {
      const response = await api.get(`${this.endpoint}/user/${userId}`);
      if (response.data && response.data.id) {
        return response.data.id;
      }
      console.warn('Employee profile not found, using default ID');
      return 1;
    } catch (error) {
      console.error(`Error fetching employee ID for user ${userId}:`, error);
      // Return default employee ID 1 instead of throwing error
      return 1;
    }
  }
  
  async create(data: any) {
    try {
      console.log('EmployeeService create method called with:', data);
      
      // Check if we need to create a user first or use existing user
      if (data.fullName && data.email && !data.userId) {
        // Create user first
        try {
          console.log('Creating user first...');
          const userData = {
            fullName: data.fullName,
            email: data.email,
            password: 'DefaultPassword123!', // This should be changed or generated securely
            role: 'employee'
          };
          
          const userResponse = await api.post('/auth/register', userData);
          console.log('User created:', userResponse.data);
          
          // Set the userId from the newly created user
          data.userId = userResponse.data.id;
          
          // Remove user-specific fields from employee data
          delete data.fullName;
          delete data.email;
        } catch (userError) {
          console.error('Error creating user:', userError);
          throw userError;
        }
      }
      
      // Now create the employee profile
      const employeeData = {
        employeeId: data.employeeId,
        department: data.department,
        position: data.position,
        phoneNumber: data.phoneNumber || data.contactNumber,
        address: data.address,
        dateOfJoining: data.dateOfJoining || data.joinDate,
        userId: data.userId
      };
      
      console.log('Sending employee data to backend:', employeeData);
      const response = await api.post(this.endpoint, employeeData);
      return response.data;
    } catch (error: any) {
      console.error(`Error creating ${this.endpoint}:`, error);
      
      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        // Format error message based on status code
        if (status === 400) {
          // Validation error
          const message = errorData.message || 'Invalid employee data';
          throw new Error(message);
        } else if (status === 401) {
          throw new Error('Authentication required. Please log in again.');
        } else if (status === 403) {
          throw new Error('You do not have permission to create employees.');
        } else if (status === 409) {
          // Conflict error - likely duplicate employee ID
          throw new Error(errorData.message || 'Employee ID already exists');
        } else {
          throw new Error(errorData.message || 'Failed to create employee');
        }
      }
      
      throw error;
    }
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    try {
      const response = await api.get(`${this.endpoint}/department/${department}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employees by department ${department}:`, error);
      throw error;
    }
  }

  async updateEmployeeStatus(id: number, status: string): Promise<Employee> {
    try {
      const response = await api.patch(`${this.endpoint}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating employee status:`, error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();