const API_URL = 'http://localhost:5000/api';

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

// Create new menu
export const createMenu = async (menuData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', menuData.name);
    formData.append('image', menuData.image); // This should be a File object

    const response = await fetch(`${API_URL}/menus`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create menu');
    }
    
    return data;
  } catch (error) {
    console.error('Create menu error:', error);
    throw error;
  }
};

// Update menu
export const updateMenu = async (id, menuData) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('name', menuData.name);
    
    // Only append image if it's a File object (new upload)
    if (menuData.image instanceof File) {
      formData.append('image', menuData.image);
    }

    const response = await fetch(`${API_URL}/menus/${id}`, {
      method: 'PUT',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update menu');
    }
    
    return data;
  } catch (error) {
    console.error('Update menu error:', error);
    throw error;
  }
};

// Delete menu
export const deleteMenu = async (id) => {
  try {
    const response = await fetch(`${API_URL}/menus/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete menu');
    }
    
    return data;
  } catch (error) {
    console.error('Delete menu error:', error);
    throw error;
  }
};