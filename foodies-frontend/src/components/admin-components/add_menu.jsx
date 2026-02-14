import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, X, Upload, Image as ImageIcon } from "lucide-react";
import { 
  getAllMenus, 
  createMenu, 
  updateMenu, 
  deleteMenu 
} from "../../services/menuService";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../common/ToastContainer";
import ConfirmModal from "../common/ConfirmModal";

const AddMenu = () => {
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Use toast hook
  const toast = useToast();

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    menuId: null,
    menuName: ""
  });

  // Form state
  const [menuName, setMenuName] = useState("");
  const [menuImage, setMenuImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch menus on component mount
  useEffect(() => {
    fetchMenus();
  }, []);

  // Fetch all menus from API
  const fetchMenus = async () => {
    try {
      setFetchLoading(true);
      const response = await getAllMenus();
      setMenus(response.data || []);
    } catch (error) {
      console.error('Error fetching menus:', error);
      toast.error('Failed to load menus. Please refresh the page.');
    } finally {
      setFetchLoading(false);
    }
  };
// Handle image upload - KEEP THE FILE OBJECT
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
    setMenuImage(file); // Store the actual File object
    
    // Create preview URL for display
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  } else {
    toast.warning("Please upload a valid image (PNG, JPEG, JPG)");
  }
};
  // Check for duplicate menu name
  const isDuplicateMenu = (name) => {
    const trimmedName = name.trim().toLowerCase();
    return menus.some(
      (menu) =>
        menu.name.toLowerCase() === trimmedName &&
        (!editingMenu || menu.id !== editingMenu.id)
    );
  };

 // Handle form submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!menuName.trim() || !menuImage) {
    toast.warning("Please fill in all fields");
    return;
  }

  // Check for duplicate menu name (client-side check)
  if (isDuplicateMenu(menuName)) {
    toast.error(`A menu with the name "${menuName.trim()}" already exists`);
    return;
  }

  setLoading(true);

  try {
    const menuData = {
      name: menuName.trim(),
      image: menuImage  // Send the File object, not base64
    };

    if (editingMenu) {
      // Update existing menu
      const response = await updateMenu(editingMenu.id, menuData);
      toast.success(response.message || 'Menu updated successfully!');
      await fetchMenus();
    } else {
      // Create new menu
      const response = await createMenu(menuData);
      toast.success(response.message || 'Menu created successfully!');
      await fetchMenus();
    }

    // Reset form
    resetForm();
  } catch (error) {
    console.error('Error saving menu:', error);
    toast.error(error.message || 'Failed to save menu');
  } finally {
    setLoading(false);
  }
};

  // Reset form
  const resetForm = () => {
    setMenuName("");
    setMenuImage(null);
    setImagePreview(null);
    setShowForm(false);
    setEditingMenu(null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (menu) => {
    setConfirmModal({
      isOpen: true,
      menuId: menu.id,
      menuName: menu.name
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setConfirmModal({
      isOpen: false,
      menuId: null,
      menuName: ""
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setLoading(true);

    try {
      const response = await deleteMenu(confirmModal.menuId);
      toast.success(response.message || 'Menu deleted successfully!');
      await fetchMenus();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error(error.message || 'Failed to delete menu');
    } finally {
      setLoading(false);
    }
  };

  // Handle update button click
  const handleUpdate = (menu) => {
    setEditingMenu(menu);
    setMenuName(menu.name);
    setImagePreview(menu.image);
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Menu"
        message={`Are you sure you want to delete "${confirmModal.menuName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />

      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Menu Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Add and manage your restaurant menus</p>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base disabled:opacity-50"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>Add Menu</span>
          </motion.button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-2 border-orange-200"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              {editingMenu ? "Edit Menu" : "Add New Menu"}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-red-600 transition-colors"
              disabled={loading}
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Menu Name Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Menu Name *
              </label>
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="Enter menu name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                required
                disabled={loading}
              />
              {menuName.trim() && isDuplicateMenu(menuName) && (
                <p className="text-red-600 text-xs sm:text-sm mt-2">
                  ⚠️ A menu with this name already exists
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Menu Image * (PNG, JPEG, JPG)
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <label className="w-full sm:w-auto flex-shrink-0 cursor-pointer">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-300 transition-colors">
                    <Upload size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Choose Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>

                {imagePreview ? (
                  <div className="relative mx-auto sm:mx-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-lg border-2 border-orange-400 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <X size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto sm:mx-0 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon size={28} className="text-gray-400 sm:w-8 sm:h-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : editingMenu ? "Update Menu" : "Add Menu"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full sm:flex-1 bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium text-sm sm:text-base disabled:opacity-50"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Menus Table */}
      {fetchLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading menus...</p>
        </div>
      ) : menus.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base">Menu</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base w-24 sm:w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menus.map((menu, index) => (
                  <motion.tr
                    key={menu.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img
                          src={menu.image}
                          alt={menu.name}
                          className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm"
                        />
                        <span className="font-semibold text-gray-800 text-sm sm:text-lg">
                          {menu.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdate(menu)}
                          disabled={loading}
                          className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                          title="Update"
                        >
                          <Edit2 size={18} className="sm:w-5 sm:h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openDeleteModal(menu)}
                          disabled={loading}
                          className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={18} className="sm:w-5 sm:h-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-200">
            {menus.map((menu, index) => (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="h-16 w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm flex-shrink-0"
                    />
                    <span className="font-semibold text-gray-800 text-base truncate">
                      {menu.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdate(menu)}
                      disabled={loading}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                      title="Update"
                    >
                      <Edit2 size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeleteModal(menu)}
                      disabled={loading}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        !showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center"
          >
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4 sm:w-16 sm:h-16" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              No Menus Added Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              Click the "Add Menu" button to create your first menu
            </p>
          </motion.div>
        )
      )}
    </div>
  );
};

export default AddMenu;