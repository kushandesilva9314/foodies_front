import { authGet, authDelete } from './apiService';

/**
 * Get all customers (admin only)
 */
export const getAllCustomers = async () => {
  try {
    const data = await authGet('/admin/users');
    return data;
  } catch (error) {
    console.error('Get all customers error:', error);
    throw error;
  }
};

/**
 * Delete a customer by ID (admin only)
 */
export const deleteCustomer = async (userId) => {
  try {
    const data = await authDelete(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    console.error('Delete customer error:', error);
    throw error;
  }
};