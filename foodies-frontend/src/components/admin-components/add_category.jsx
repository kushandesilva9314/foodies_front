import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, X, Upload, Image as ImageIcon } from "lucide-react";

const AddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      setCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image (PNG, JPEG, JPG)");
    }
  };

  // Check for duplicate category name
  const isDuplicateCategory = (name) => {
    const trimmedName = name.trim().toLowerCase();
    return categories.some(
      (category) =>
        category.name.toLowerCase() === trimmedName &&
        (!editingCategory || category.id !== editingCategory.id)
    );
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!categoryName.trim() || !categoryImage) {
      alert("Please fill in all fields");
      return;
    }

    // Check for duplicate category name
    if (isDuplicateCategory(categoryName)) {
      alert(`A category with the name "${categoryName.trim()}" already exists. Please use a different name.`);
      return;
    }

    if (editingCategory) {
      // Update existing category
      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id
            ? { ...category, name: categoryName.trim(), image: imagePreview }
            : category
        )
      );
      setEditingCategory(null);
    } else {
      // Add new category
      const newCategory = {
        id: Date.now(),
        name: categoryName.trim(),
        image: imagePreview,
      };
      setCategories([...categories, newCategory]);
    }

    // Reset form
    setCategoryName("");
    setCategoryImage(null);
    setImagePreview(null);
    setShowForm(false);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter((category) => category.id !== id));
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setImagePreview(category.image);
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setImagePreview(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Category Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Add and manage your food categories</p>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>Add Category</span>
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
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Category Name Input */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter category name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                required
              />
              {categoryName.trim() && isDuplicateCategory(categoryName) && (
                <p className="text-red-600 text-xs sm:text-sm mt-2">
                  ⚠️ A category with this name already exists
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Category Image * (PNG, JPEG, JPG)
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {/* Upload Button */}
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
                  />
                </label>

                {/* Image Preview */}
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
                        setCategoryImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
              >
                {editingCategory ? "Update Category" : "Add Category"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleCancel}
                className="w-full sm:flex-1 bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium text-sm sm:text-base"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Categories Table */}
      {categories.length > 0 ? (
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
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base">Category</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base w-24 sm:w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category, index) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Category Column */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm"
                        />
                        <span className="font-semibold text-gray-800 text-sm sm:text-lg">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        {/* Edit Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(category)}
                          className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} className="sm:w-5 sm:h-5" />
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-16 w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm"
                    />
                    <span className="font-semibold text-gray-800 text-base">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Edit Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(category)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </motion.button>

                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(category.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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
              No Categories Added Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500">Click the "Add Category" button to create your first category</p>
          </motion.div>
        )
      )}
    </div>
  );
};

export default AddCategory;