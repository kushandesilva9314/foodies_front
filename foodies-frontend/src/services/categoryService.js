const API_URL = 'http://localhost:5000/api';

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

// Create new category
export const createCategory = async (categoryData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('image', categoryData.image); // This should be a File object

    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      // DO NOT set Content-Type header - browser will set it automatically with boundary
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create category');
    }
    
    return data;
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
};

// Update category
export const updateCategory = async (id, categoryData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', categoryData.name);
    
    // Only append image if it's a File object (new upload)
    if (categoryData.image instanceof File) {
      formData.append('image', categoryData.image);
    }

    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update category');
    }
    
    return data;
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete category');
    }
    
    return data;
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};