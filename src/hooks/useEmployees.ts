'use client';

import { useState, useEffect } from 'react';
import { employeeService, Employee } from '../services/employee.service';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeesByDepartment = async (department: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployeesByDepartment(department);
      return data;
    } catch (err) {
      setError(`Failed to fetch employees in ${department} department`);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: Omit<Employee, 'id'> & { employeeId?: string; userId?: number }) => {
    try {
      console.log('Creating employee with data:', employeeData);
      
      // Transform frontend form data to match backend DTO
      const transformedData = {
        employeeId: employeeData.employeeId || `EMP${Math.floor(Math.random() * 10000)}`, // Generate employeeId if not provided
        department: employeeData.department,
        position: employeeData.position,
        phoneNumber: employeeData.contactNumber,
        address: employeeData.address,
        dateOfJoining: employeeData.joinDate,
        // If we're creating a new user along with employee profile
        fullName: employeeData.fullName,
        email: employeeData.email,
        // If we're connecting to existing user
        userId: employeeData.userId
      };
      
      console.log('Transformed data for backend:', transformedData);
      const newEmployee = await employeeService.create(transformedData);
      setEmployees([...employees, newEmployee]);
      return newEmployee;
    } catch (err: any) {
      console.error('Error details:', err);
      
      // Set a more specific error message if available
      if (err.message) {
        setError(err.message);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create employee');
      }
      
      throw err;
    }
  };

  const updateEmployee = async (id: number, employeeData: Partial<Employee>) => {
    try {
      const updatedEmployee = await employeeService.update(id, employeeData);
      setEmployees(employees.map(emp => emp.id === id ? updatedEmployee : emp));
      return updatedEmployee;
    } catch (err) {
      setError(`Failed to update employee ${id}`);
      console.error(err);
      throw err;
    }
  };

  const deleteEmployee = async (id: number) => {
    try {
      await employeeService.delete(id);
      setEmployees(employees.filter(emp => emp.id !== id));
    } catch (err) {
      setError(`Failed to delete employee ${id}`);
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getEmployee = async (id: string | number) => {
    try {
      // Add a small delay before making the API call to stabilize loading states
      await new Promise(resolve => setTimeout(resolve, 200));
      const response = await employeeService.getById(id);
      // Add a small delay after successful response to ensure UI stability
      await new Promise(resolve => setTimeout(resolve, 100));
      return response;
    } catch (error) {
      console.error("Error fetching employee:", error);
      // Add a longer delay for errors to prevent rapid state changes causing blinking
      await new Promise(resolve => setTimeout(resolve, 500));
      throw error;
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    getEmployeesByDepartment,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee
  };
}