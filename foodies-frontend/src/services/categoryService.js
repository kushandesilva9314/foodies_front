import { authPostFormData, authPutFormData, authDelete } from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }
    
    return data;
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
};

// Get single category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch category');
    }
    
    return data;
  } catch (error) {
    console.error('Get category error:', error);
    throw error;
  }
};

// Create new category (admin only)
export const createCategory = async (categoryData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('image', categoryData.image); // This should be a File object

    // authPostFormData handles the Authorization header and
    // Content-Type is still left unset for the browser to add the boundary
    return await authPostFormData('/categories', formData);
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
};

// Update category (admin only)
export const updateCategory = async (id, categoryData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', categoryData.name);
    
    // Only append image if it's a File object (new upload)
    if (categoryData.image instanceof File) {
      formData.append('image', categoryData.image);
    }

    return await authPutFormData(`/categories/${id}`, formData);
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

// Delete category (admin only)
export const deleteCategory = async (id) => {
  try {
    return await authDelete(`/categories/${id}`);
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};