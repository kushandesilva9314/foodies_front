import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, X, Upload, Image as ImageIcon } from "lucide-react";

const AddProduct = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Dummy data for dropdowns - Replace with actual data from Menu and Category components
  const [menus] = useState([
    { id: 1, name: "Breakfast" },
    { id: 2, name: "Lunch" },
    { id: 3, name: "Dinner" },
  ]);

  const [categories] = useState([
    { id: 1, name: "Appetizers" },
    { id: 2, name: "Main Course" },
    { id: 3, name: "Desserts" },
    { id: 4, name: "Beverages" },
  ]);

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

  // Handle image upload
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
      alert("Please upload a valid image (PNG, JPEG, JPG)");
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
        product.itemNo.toLowerCase() === trimmedItemNo &&
        (!editingProduct || product.id !== editingProduct.id)
    );
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!itemNo.trim() || !productName.trim() || !productImage || !description.trim() || !price || !selectedCategory) {
      alert("Please fill in all required fields");
      return;
    }

    // Check for duplicate item number
    if (isDuplicateItemNo(itemNo)) {
      alert(`A product with Item No "${itemNo.trim()}" already exists. Please use a different Item No.`);
      return;
    }

    // Validate price
    if (isNaN(price) || parseFloat(price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    // Validate discount
    if (isNaN(discount) || parseFloat(discount) < 0 || parseFloat(discount) > 100) {
      alert("Discount must be between 0 and 100");
      return;
    }

    // Ensure discount is 0 if featured is No
    const finalDiscount = featured === "no" ? 0 : parseFloat(discount);

    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                itemNo: itemNo.trim(),
                name: productName.trim(),
                image: imagePreview,
                description: description.trim(),
                price: parseFloat(price),
                availability: availability,
                menu: selectedMenu,
                category: selectedCategory,
                featured: featured,
                discount: finalDiscount,
              }
            : product
        )
      );
      setEditingProduct(null);
    } else {
      // Add new product with featured and discount set to defaults
      const newProduct = {
        id: Date.now(),
        itemNo: itemNo.trim(),
        name: productName.trim(),
        image: imagePreview,
        description: description.trim(),
        price: parseFloat(price),
        availability: availability,
        menu: selectedMenu,
        category: selectedCategory,
        featured: "no", // Default value (not shown in Add form)
        discount: 0, // Default value (not shown in Add form)
      };
      setProducts([...products, newProduct]);
    }

    // Reset form
    resetForm();
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
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  // Handle update
  const handleUpdate = (product) => {
    setEditingProduct(product);
    setItemNo(product.itemNo);
    setProductName(product.name);
    setImagePreview(product.image);
    setDescription(product.description);
    setPrice(product.price.toString());
    setAvailability(product.availability);
    setSelectedMenu(product.menu);
    setSelectedCategory(product.category);
    setFeatured(product.featured);
    setDiscount(product.discount.toString());
    setShowForm(true);
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  // Get menu name by id
  const getMenuName = (menuId) => {
    const menu = menus.find((m) => m.id === parseInt(menuId));
    return menu ? menu.name : "N/A";
  };

  // Get category name by id
  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === parseInt(categoryId));
    return category ? category.name : "N/A";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
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
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
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
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Row 1: Item No and Product Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Item No */}
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
                />
                {itemNo.trim() && isDuplicateItemNo(itemNo) && (
                  <p className="text-red-600 text-xs sm:text-sm mt-2">
                    ⚠️ A product with this Item No already exists
                  </p>
                )}
              </div>

              {/* Product Name */}
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
                />
              </div>
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Product Image * (PNG, JPEG, JPG)
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
                        setProductImage(null);
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
              />
            </div>

            {/* Row 2: Price and Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Price */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Price * (LKR)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and decimal point
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setPrice(value);
                    }
                  }}
                  placeholder="Enter price"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Availability *
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            {/* Row 3: Menu and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Menu (Optional) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Menu (Optional)
                </label>
                <select
                  value={selectedMenu}
                  onChange={(e) => setSelectedMenu(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                >
                  <option value="">-- Select Menu --</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category (Required) */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
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
                {/* Featured */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Featured
                  </label>
                  <select
                    value={featured}
                    onChange={(e) => handleFeaturedChange(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                {/* Discount */}
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
                      // Allow only numbers and decimal point
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        // Ensure value is between 0 and 100
                        if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                          setDiscount(value);
                        }
                      }
                    }}
                    placeholder="Enter discount percentage"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={featured === "no"}
                  />
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
                className="w-full sm:flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
              >
                {editingProduct ? "Update Product" : "Add Product"}
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

      {/* Products Table */}
      {products.length > 0 ? (
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
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base">Category</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base">Availability</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base w-24 sm:w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Item No */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="font-mono text-gray-700 text-sm sm:text-base">{product.itemNo}</span>
                    </td>

                    {/* Product Column */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">{product.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">
                        LKR {product.price.toFixed(2)}
                      </span>
                      {product.featured === "yes" && product.discount > 0 && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-gray-700 text-sm sm:text-base">{getCategoryName(product.category)}</span>
                    </td>

                    {/* Availability */}
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

                    {/* Action Column */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                        {/* Update Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdate(product)}
                          className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Update"
                        >
                          <Edit2 size={18} className="sm:w-5 sm:h-5" />
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(product.id)}
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

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Product Image and Name */}
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 object-cover rounded-lg border-2 border-orange-300 shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-base mb-1">{product.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                    <span className="inline-block font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      #{product.itemNo}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      LKR {product.price.toFixed(2)}
                      {product.featured === "yes" && product.discount > 0 && (
                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <p className="text-sm text-gray-700">{getCategoryName(product.category)}</p>
                  </div>
                </div>

                {/* Availability and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      product.availability === "yes"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.availability === "yes" ? "Available" : "Unavailable"}
                  </span>
                  <div className="flex items-center space-x-2">
                    {/* Update Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdate(product)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Update"
                    >
                      <Edit2 size={18} />
                    </motion.button>

                    {/* Delete Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(product.id)}
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