import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  UserCircle,
  History,
  Package,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");

  // Real auth state from localStorage
 const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [user, setUser] = useState(
    storedUser ? JSON.parse(storedUser) : { name: "", profile_photo: null },
  );

  const navLinks = [
    { name: "Home", id: "home" },
    { name: "Menus", id: "menus" },
    { name: "Food", id: "food" },
    { name: "About", id: "about" },
    { name: "Contact", id: "contact" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle logout
const handleLogout = async () => {
  const { logoutUser } = await import("../../services/authService");
  await logoutUser();
  // Navbar only:
  setIsLoggedIn(false);
  setUser({ name: "", profile_photo: null });
  navigate("/login");
};
  // Handle sign in — navigate to signup page
  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="max-w-full mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Far Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3 flex-shrink-0"
          >
            <div className="relative h-12 w-12">
              <div className="relative bg-white rounded-full p-0.5 shadow-lg h-full w-full flex items-center justify-center">
                <img
                  src={logo}
                  alt="Foodies Logo"
                  className="h-10 w-10 object-cover rounded-full"
                />
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              FOODIES
            </div>
          </motion.div>

          {/* Desktop Navigation Links - Center */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:flex space-x-8 absolute left-1/3 transform -translate-x-1/3 top-1/1 -translate-y-1/1"
          >
            {navLinks.map((link, index) => (
              <motion.a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setActiveLink(link.id)}
                className={`text-base font-medium transition-all duration-300 relative ${
                  activeLink === link.id
                    ? "text-orange-600"
                    : "text-gray-700 hover:text-orange-500"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {link.name}
                {activeLink === link.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
          </motion.div>

          {/* Right Side - Profile & Cart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden md:flex items-center space-x-4 flex-shrink-0"
          >
            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              <ShoppingCart size={20} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white"
              >
                0
              </motion.span>
            </motion.button>

            {/* Profile Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover border-2 border-orange-400"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-800">
                  {user.name}
                </span>
                <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-gray-300">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/profile")}
                    className="p-2 hover:bg-orange-100 rounded-full transition-colors group"
                    title="Profile"
                  >
                    <UserCircle
                      size={20}
                      className="text-gray-600 group-hover:text-orange-600"
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/orders")}
                    className="p-2 hover:bg-orange-100 rounded-full transition-colors group"
                    title="Orders"
                  >
                    <Package
                      size={20}
                      className="text-gray-600 group-hover:text-orange-600"
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/history")}
                    className="p-2 hover:bg-orange-100 rounded-full transition-colors group"
                    title="History"
                  >
                    <History
                      size={20}
                      className="text-gray-600 group-hover:text-orange-600"
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors group"
                    title="Logout"
                  >
                    <LogOut
                      size={20}
                      className="text-gray-600 group-hover:text-red-600"
                    />
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignIn}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2.5 rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 font-medium"
              >
                <User size={18} />
                <span>Sign In</span>
              </motion.button>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={
          isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-gray-50"
      >
        <div className="px-4 pt-2 pb-4 space-y-3">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => {
                setActiveLink(link.id);
                setIsOpen(false);
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`block text-base font-medium py-3 px-4 rounded-lg transition-all duration-200 ${
                activeLink === link.id
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {link.name}
            </motion.a>
          ))}

          {/* Mobile Cart & Profile */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all font-medium"
            >
              <ShoppingCart size={20} />
              <span>Cart (0)</span>
            </motion.button>

            {isLoggedIn ? (
              <>
                <motion.div className="w-full bg-white border-2 border-gray-200 px-4 py-3 rounded-lg flex items-center space-x-3">
                  {user.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-orange-400"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-semibold">
                        {getUserInitials()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-start flex-grow">
                    <span className="font-semibold text-gray-800">
                      {user.name}
                    </span>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                    className="bg-white border-2 border-gray-200 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:border-orange-300 hover:bg-orange-50 transition-all"
                  >
                    <UserCircle size={18} className="text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Profile
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate("/orders");
                      setIsOpen(false);
                    }}
                    className="bg-white border-2 border-gray-200 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:border-orange-300 hover:bg-orange-50 transition-all"
                  >
                    <Package size={18} className="text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Orders
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      navigate("/history");
                      setIsOpen(false);
                    }}
                    className="bg-white border-2 border-gray-200 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:border-orange-300 hover:bg-orange-50 transition-all"
                  >
                    <History size={18} className="text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      History
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="bg-white border-2 border-red-200 px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hover:border-red-300 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={18} className="text-red-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Logout
                    </span>
                  </motion.button>
                </div>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSignIn}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all font-medium"
              >
                <User size={20} />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
