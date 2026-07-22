import { authPostFormData, authPutFormData, authDelete } from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all menus
export const getAllMenus = async () => {
  try {
    const response = await fetch(`${API_URL}/menus`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch menus');
    }
    
    return data;
  } catch (error) {
    console.error('Get menus error:', error);
    throw error;
  }
};

// Get single menu by ID
export const getMenuById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/menus/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch menu');
    }
    
    return data;
  } catch (error) {
    console.error('Get menu error:', error);
    throw error;
  }
};

// Create new menu (admin only)
export const createMenu = async (menuData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', menuData.name);
    formData.append('image', menuData.image); // This should be a File object

    return await authPostFormData('/menus', formData);
  } catch (error) {
    console.error('Create menu error:', error);
    throw error;
  }
};

// Update menu (admin only)
export const updateMenu = async (id, menuData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', menuData.name);
    
    // Only append image if it's a File object (new upload)
    if (menuData.image instanceof File) {
      formData.append('image', menuData.image);
    }

    return await authPutFormData(`/menus/${id}`, formData);
  } catch (error) {
    console.error('Update menu error:', error);
    throw error;
  }
};

// Delete menu (admin only)
export const deleteMenu = async (id) => {
  try {
    return await authDelete(`/menus/${id}`);
  } catch (error) {
    console.error('Delete menu error:', error);
    throw error;
  }
};