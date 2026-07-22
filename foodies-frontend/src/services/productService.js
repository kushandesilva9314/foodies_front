import { authPostFormData, authPutFormData, authDelete } from './apiService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get all products
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }
    
    return data;
  } catch (error) {
    console.error('Get products error:', error);
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product');
    }
    
    return data;
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

// Create new product (admin only)
export const createProduct = async (productData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('item_no', productData.item_no);
    formData.append('name', productData.name);
    formData.append('image', productData.image); // File object
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('availability', productData.availability);
    
    // Optional fields
    if (productData.menu_id) {
      formData.append('menu_id', productData.menu_id);
    }
    if (productData.category_id) {
      formData.append('category_id', productData.category_id);
    }

    // Portions (Small/Medium/Large) — sent as a JSON string since
    // FormData can't carry nested objects directly
    if (productData.portions) {
      formData.append('portions', JSON.stringify(productData.portions));
    }

    // Uses authPostFormData instead of raw fetch — attaches the
    // Authorization header and auto-refreshes the token if expired.
    return await authPostFormData('/products', formData);
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};

// Update product (admin only)
export const updateProduct = async (id, productData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('item_no', productData.item_no);
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('availability', productData.availability);
    
    // Only append image if it's a File object (new upload)
    if (productData.image instanceof File) {
      formData.append('image', productData.image);
    }
    
    // Optional fields
    if (productData.menu_id) {
      formData.append('menu_id', productData.menu_id);
    }
    if (productData.category_id) {
      formData.append('category_id', productData.category_id);
    }
    
    // Featured and discount (for update)
    if (productData.featured !== undefined) {
      formData.append('featured', productData.featured);
    }
    if (productData.discount !== undefined) {
      formData.append('discount', productData.discount);
    }

    // Portions (Small/Medium/Large) — sent as a JSON string since
    // FormData can't carry nested objects directly
    if (productData.portions) {
      formData.append('portions', JSON.stringify(productData.portions));
    }

    return await authPutFormData(`/products/${id}`, formData);
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};

// Delete product (admin only)
export const deleteProduct = async (id) => {
  try {
    return await authDelete(`/products/${id}`);
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};