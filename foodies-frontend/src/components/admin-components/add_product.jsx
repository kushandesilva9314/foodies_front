import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, X, Upload, Image as ImageIcon } from "lucide-react";
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../../services/productService";
import { getAllMenus } from "../../services/menuService";
import { getAllCategories } from "../../services/categoryService";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../common/ToastContainer";
import ConfirmModal from "../common/ConfirmModal";

const AddProduct = () => {
  const [products, setProducts] = useState([]);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Use toast hook
  const toast = useToast();

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: null,
    productName: ""
  });

  // Form state
  const [itemNo, setItemNo] = useState("");
  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("yes");
  const [selectedMenu, setSelectedMenu] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [featured, setFeatured] = useState("no");
  const [discount, setDiscount] = useState("0");

  // Calculate discounted price
  const calculateDiscountedPrice = (originalPrice, discountPercent) => {
    if (!discountPercent || discountPercent === 0) return originalPrice;
    return originalPrice - (originalPrice * discountPercent / 100);
  };

  // Get display price for a product
  const getDisplayPrice = (product) => {
    const originalPrice = parseFloat(product.price);
    if (product.featured === "yes" && product.discount > 0) {
      return {
        original: originalPrice,
        discounted: calculateDiscountedPrice(originalPrice, product.discount),
        hasDiscount: true
      };
    }
    return {
      original: originalPrice,
      discounted: originalPrice,
      hasDiscount: false
    };
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch products, menus, and categories
  const fetchAllData = async () => {
    try {
      setFetchLoading(true);
      
      const [productsRes, menusRes, categoriesRes] = await Promise.all([
        getAllProducts(),
        getAllMenus(),
        getAllCategories()
      ]);
      
      setProducts(productsRes.data || []);
      setMenus(menusRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please refresh the page.');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle image upload - KEEP THE FILE OBJECT
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      setProductImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.warning("Please upload a valid image (PNG, JPEG, JPG)");
    }
  };

  // Handle featured change - reset discount to 0 if featured is No
  const handleFeaturedChange = (value) => {
    setFeatured(value);
    if (value === "no") {
      setDiscount("0");
    }
  };

  // Check for duplicate item number
  const isDuplicateItemNo = (itemNumber) => {
    const trimmedItemNo = itemNumber.trim().toLowerCase();
    return products.some(
      (product) =>
        product.item_no.toLowerCase() === trimmedItemNo &&
        (!editingProduct || product.id !== editingProduct.id)
    );
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // For CREATE: require image file
    // For UPDATE: image is optional (only required if user wants to change it)
    if (!editingProduct && !productImage) {
      toast.warning("Please upload a product image");
      return;
    }

    if (!itemNo.trim() || !productName.trim() || !description.trim() || !price) {
      toast.warning("Please fill in all required fields");
      return;
    }

    if (isDuplicateItemNo(itemNo)) {
      toast.error(`A product with Item No "${itemNo.trim()}" already exists`);
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (isNaN(discount) || parseFloat(discount) < 0 || parseFloat(discount) > 100) {
      toast.error("Discount must be between 0 and 100");
      return;
    }

    setLoading(true);

    try {
      const productData = {
        item_no: itemNo.trim(),
        name: productName.trim(),
        description: description.trim(),
        price: parseFloat(price),
        availability: availability,
        menu_id: selectedMenu || null,
        category_id: selectedCategory || null,
      };

      // Only add image if it's a new file (File object)
      if (productImage instanceof File) {
        productData.image = productImage;
      }

      if (editingProduct) {
        productData.featured = featured;
        productData.discount = parseFloat(discount);
        
        const response = await updateProduct(editingProduct.id, productData);
        toast.success(response.message || 'Product updated successfully!');
        await fetchAllData();
      } else {
        // For create, image is always required and already checked above
        productData.image = productImage;
        const response = await createProduct(productData);
        toast.success(response.message || 'Product created successfully!');
        await fetchAllData();
      }

      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setItemNo("");
    setProductName("");
    setProductImage(null);
    setImagePreview(null);
    setDescription("");
    setPrice("");
    setAvailability("yes");
    setSelectedMenu("");
    setSelectedCategory("");
    setFeatured("no");
    setDiscount("0");
    setShowForm(false);
    setEditingProduct(null);
  };

  // Open delete confirmation modal
  const openDeleteModal = (product) => {
    setConfirmModal({
      isOpen: true,
      productId: product.id,
      productName: product.name
    });
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setConfirmModal({
      isOpen: false,
      productId: null,
      productName: ""
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setLoading(true);

    try {
      const response = await deleteProduct(confirmModal.productId);
      toast.success(response.message || 'Product deleted successfully!');
      await fetchAllData();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Handle update button click
  const handleUpdate = (product) => {
    setEditingProduct(product);
    setItemNo(product.item_no);
    setProductName(product.name);
    setImagePreview(product.image); // Show existing image URL
    setProductImage(null); // Reset to null - user can optionally upload new image
    setDescription(product.description);
    setPrice(product.price.toString());
    setAvailability(product.availability);
    setSelectedMenu(product.menu_id || "");
    setSelectedCategory(product.category_id || "");
    setFeatured(product.featured);
    setDiscount(product.discount.toString());
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    resetForm();
  };

  // Get menu name by id
  const getMenuName = (menuId) => {
    if (!menuId) return "N/A";
    const menu = menus.find((m) => m.id === menuId);
    return menu ? menu.name : "N/A";
  };

  // Get category name by id
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "N/A";
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "N/A";
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
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmModal.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />

      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Product Management</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Add and manage your products</p>
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
            <span>Add Product</span>
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
              {editingProduct ? "Edit Product" : "Add New Product"}
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
            {/* Row 1: Item No and Product Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Item No *
                </label>
                <input
                  type="text"
                  value={itemNo}
                  onChange={(e) => setItemNo(e.target.value)}
                  placeholder="Enter item number"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                />
                {itemNo.trim() && isDuplicateItemNo(itemNo) && (
                  <p className="text-red-600 text-xs sm:text-sm mt-2">
                    ⚠️ A product with this Item No already exists
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Product Image * {editingProduct && "(Optional - upload only if changing image)"}
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <label className="w-full sm:w-auto flex-shrink-0 cursor-pointer">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-300 transition-colors">
                    <Upload size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                      {editingProduct ? "Change Image" : "Choose Image"}
                    </span>
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
                    {productImage instanceof File && (
                      <button
                        type="button"
                        onClick={() => {
                          setProductImage(null);
                          setImagePreview(editingProduct ? editingProduct.image : null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        disabled={loading}
                      >
                        <X size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto sm:mx-0 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon size={28} className="text-gray-400 sm:w-8 sm:h-8" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Product Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows="4"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors resize-none"
                required
                disabled={loading}
              />
            </div>

            {/* Row 2: Price and Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Price * (LKR)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setPrice(value);
                    }
                  }}
                  placeholder="Enter price"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Availability *
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Row 3: Menu and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Menu (Optional)
                </label>
                <select
                  value={selectedMenu}
                  onChange={(e) => setSelectedMenu(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  disabled={loading}
                >
                  <option value="">-- Select Menu --</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  disabled={loading}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Featured and Discount (Only show when editing) */}
            {editingProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t-2 border-gray-200">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Featured
                  </label>
                  <select
                    value={featured}
                    onChange={(e) => handleFeaturedChange(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    disabled={loading}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Discount (%)
                    {featured === "yes" && <span className="text-orange-600 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                          setDiscount(value);
                        }
                      }
                    }}
                    placeholder="Enter discount percentage"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={featured === "no" || loading}
                  />
                  {featured === "yes" && price && discount && parseFloat(discount) > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs sm:text-sm text-green-700">
                        💰 Final Price: <span className="font-bold">LKR {calculateDiscountedPrice(parseFloat(price), parseFloat(discount)).toFixed(2)}</span>
                      </p>
                    </div>
                  )}
                  {featured === "yes" && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Discount is applicable when product is featured
                    </p>
                  )}
                  {featured === "no" && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Set Featured to "Yes" to enable discount
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
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

      {/* Products Table */}
      {fetchLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">Loading products...</p>
        </div>
      ) : products.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base">Item No</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base">Product</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base">Price</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base">Availability</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base w-24 sm:w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => {
                  const priceInfo = getDisplayPrice(product);
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="font-mono text-gray-700 text-sm sm:text-base">{product.item_no}</span>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm"
                          />
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{product.name}</span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {priceInfo.hasDiscount ? (
                          <div className="flex flex-col">
                            <span className="text-gray-400 line-through text-xs sm:text-sm">
                              LKR {priceInfo.original.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600 text-sm sm:text-base">
                                LKR {priceInfo.discounted.toFixed(2)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                                -{product.discount}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">
                            LKR {priceInfo.original.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                            product.availability === "yes"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.availability === "yes" ? "Available" : "Unavailable"}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdate(product)}
                            disabled={loading}
                            className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                            title="Update"
                          >
                            <Edit2 size={18} className="sm:w-5 sm:h-5" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(product)}
                            disabled={loading}
                            className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={18} className="sm:w-5 sm:h-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View - SIMPLIFIED */}
          <div className="lg:hidden divide-y divide-gray-200">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Image, Name, Item No, and Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Product Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm flex-shrink-0"
                  />
                  
                  {/* Name and Item No */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 truncate">
                      {product.name}
                    </h4>
                    <span className="inline-block font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      #{product.item_no}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdate(product)}
                      disabled={loading}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                      title="Update"
                    >
                      <Edit2 size={18} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeleteModal(product)}
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
              No Products Added Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500">Click the "Add Product" button to create your first product</p>
          </motion.div>
        )
      )}
    </div>
  );
};

export default AddProduct;