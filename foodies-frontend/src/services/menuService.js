import { authPostFormData, authPutFormData, authDelete } from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all menus (each includes its embedded categories array)
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

// Get single menu by ID (includes its embedded categories array)
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
    const formData = new FormData();
    formData.append('name', menuData.name);
    formData.append('image', menuData.image);

    if (menuData.position !== undefined && menuData.position !== '') {
      formData.append('position', menuData.position);
    }

    return await authPostFormData('/menus', formData);
  } catch (error) {
    console.error('Create menu error:', error);
    throw error;
  }
};

// Update menu (admin only)
export const updateMenu = async (id, menuData) => {
  try {
    const formData = new FormData();
    formData.append('name', menuData.name);

    if (menuData.image instanceof File) {
      formData.append('image', menuData.image);
    }

    if (menuData.position !== undefined && menuData.position !== '') {
      formData.append('position', menuData.position);
    }

    return await authPutFormData(`/menus/${id}`, formData);
  } catch (error) {
    console.error('Update menu error:', error);
    throw error;
  }
};

// Delete menu (admin only) — cascades to delete its categories too
export const deleteMenu = async (id) => {
  try {
    return await authDelete(`/menus/${id}`);
  } catch (error) {
    console.error('Delete menu error:', error);
    throw error;
  }
};

// ---------- Categories, nested within a menu ----------

// Create a category inside a specific menu (admin only)
export const createMenuCategory = async (menuId, categoryData) => {
  try {
    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('image', categoryData.image);

    if (categoryData.position !== undefined && categoryData.position !== '') {
      formData.append('position', categoryData.position);
    }

    return await authPostFormData(`/menus/${menuId}/categories`, formData);
  } catch (error) {
    console.error('Create menu category error:', error);
    throw error;
  }
};

// Update a category within its menu (admin only)
export const updateMenuCategory = async (menuId, categoryId, categoryData) => {
  try {
    const formData = new FormData();
    formData.append('name', categoryData.name);

    if (categoryData.image instanceof File) {
      formData.append('image', categoryData.image);
    }

    if (categoryData.position !== undefined && categoryData.position !== '') {
      formData.append('position', categoryData.position);
    }

    return await authPutFormData(`/menus/${menuId}/categories/${categoryId}`, formData);
  } catch (error) {
    console.error('Update menu category error:', error);
    throw error;
  }
};

// Delete a category from its menu (admin only)
export const deleteMenuCategory = async (menuId, categoryId) => {
  try {
    return await authDelete(`/menus/${menuId}/categories/${categoryId}`);
  } catch (error) {
    console.error('Delete menu category error:', error);
    throw error;
  }
};