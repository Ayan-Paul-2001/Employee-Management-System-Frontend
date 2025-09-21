'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee } from '@/services/employee.service';

// Employee type is imported from the service

export default function EmployeesPage() {
  const { employees, loading, error, fetchEmployees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter employees based on search term

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee: { fullName: string; email: string; department: string; position: string; }) => {
    // Skip filtering if search term is empty
    if (!searchTerm) return true;
    
    // Safely check each property before calling toLowerCase
    const fullNameMatch = employee.fullName ? employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const emailMatch = employee.email ? employee.email.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const departmentMatch = employee.department ? employee.department.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const positionMatch = employee.position ? employee.position.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    return fullNameMatch || emailMatch || departmentMatch || positionMatch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
        <Link
          href="/dashboard/employees/add"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Add Employee
        </Link>
      </div>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search employees..."
          className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-primary-550 focus:border-primary-550"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
          <button 
            className="ml-2 underline" 
            onClick={() => fetchEmployees()}
          >
             Failed! Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white shadow p-6 text-center rounded-md">
          {searchTerm ? 'No employees match your search.' : 'No employees found.'}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-350">
            {filteredEmployees.map((employee) => (
              <li key={employee.id || `emp-${Math.random()}`}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-primary-400 truncate">{employee.fullName || 'No Name'}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                          {employee.email || 'No Email'}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <p>
                            {employee.position || 'No Position'} • {employee.department || 'No Department'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex overflow-hidden">
                        <p
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {employee.status || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    <Link
                      href={`/dashboard/employees/${employee.id || '#'}`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}