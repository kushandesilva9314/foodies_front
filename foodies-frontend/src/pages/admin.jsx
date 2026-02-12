import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  LogOut,
  Users,
  Star,
  Wrench,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";
import AddMenu from "../components/admin-components/add_menu.jsx";
import AddCategory from "../components/admin-components/add_category.jsx";
import ProductComponent from "../components/admin-components/add_product.jsx";

const Admin = () => {
  const [activeNav, setActiveNav] = useState("catalog");
  const [activeCatalogTab, setActiveCatalogTab] = useState("product");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // DUMMY DATA - Replace with actual admin data
  const admin = {
    name: "Admin",
    profileImage: null, // Set to null for default avatar, or add image URL
  };

  const navItems = [
    { id: "catalog", name: "Items", icon: LayoutGrid },
    { id: "orders", name: "Orders", icon: ShoppingBag },
    { id: "users", name: "Users", icon: Users },
    { id: "reviews", name: "Reviews", icon: Star },
    { id: "services", name: "Services", icon: Wrench },
    { id: "sales", name: "Sales", icon: TrendingUp },
  ];

  const catalogTabs = [
    { id: "product", name: "Product" },
    { id: "menu", name: "Menu" },
    { id: "categorize", name: "Categorize" },
  ];

  const handleLogout = () => {
    // DUMMY ACTION - Replace with actual logout logic
    console.log("Admin logout clicked");
  };

  const handleNavClick = (itemId) => {
    setActiveNav(itemId);
    if (itemId === "catalog") {
      setActiveCatalogTab("product");
    }
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  // Get admin initials for avatar
  const getAdminInitials = () => {
    return admin.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          />
        )}
      </AnimatePresence>

      {/* Left Vertical Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{
          x: isMobileMenuOpen ? 0 : window.innerWidth >= 1024 ? 0 : -300,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white fixed left-0 top-0 h-screen flex flex-col shadow-2xl z-40"
      >
        {/* Logo Section */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            {/* Logo without animation */}
            <div className="relative h-10 w-10 sm:h-12 sm:w-12">
              <div className="relative bg-white rounded-full p-0.5 shadow-lg h-full w-full flex items-center justify-center">
                <img
                  src={logo}
                  alt="Foodies Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-cover rounded-full"
                />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              FOODIES
            </h2>
          </div>

          {/* Admin Profile */}
          <div className="flex flex-col items-center mt-4 sm:mt-6">
            {admin.profileImage ? (
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={admin.profileImage}
                alt={admin.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-4 border-orange-400 shadow-lg"
              />
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg border-4 border-orange-300"
              >
                <span className="text-white text-xl sm:text-2xl font-bold">
                  {getAdminInitials()}
                </span>
              </motion.div>
            )}
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-gray-300">
              {admin.name}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow py-4 sm:py-6 overflow-y-auto">
          <ul className="space-y-2 px-3 sm:px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.id}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 ${
                      activeNav === item.id
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon size={18} className="sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">
                      {item.name}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button - Bottom */}
        <div className="p-3 sm:p-4 border-t border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-lg"
          >
            <LogOut size={18} className="sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="w-full lg:ml-64 flex-grow p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 capitalize">
              {activeNav === "catalog" ? "Items" : activeNav}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {activeNav === "catalog"
                ? "Manage your products, menus, and categories"
                : `Manage your ${activeNav} efficiently`}
            </p>
          </motion.div>

          {/* Catalog Tabs - Only show when Catalog is active */}
          {activeNav === "catalog" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3"
            >
              {catalogTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCatalogTab(tab.id)}
                  className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-300 border-2 text-sm sm:text-base ${
                    activeCatalogTab === tab.id
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-orange-600 shadow-md"
                      : "bg-white text-gray-600 border-gray-300 hover:border-orange-400 hover:bg-gray-50"
                  }`}
                >
                  {tab.name}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Content Area */}
          <motion.div
            key={activeNav === "catalog" ? activeCatalogTab : activeNav}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 min-h-[400px] sm:min-h-[600px]"
          >
            {/* Catalog Components */}
            {activeNav === "catalog" && activeCatalogTab === "menu" && (
              <AddMenu />
            )}
            {activeNav === "catalog" && activeCatalogTab === "categorize" && (
              <AddCategory />
            )}
            {activeNav === "catalog" && activeCatalogTab === "product" && (
              <ProductComponent />
            )}

            {/* Other Nav Options - Placeholder for non-catalog sections */}
            {activeNav !== "catalog" && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-base sm:text-lg text-center px-4">
                  {activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}{" "}
                  component will be imported here
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Admin;