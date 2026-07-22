import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Trash2,
  Eye,
  X,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Calendar,
  Search,
  UserX,
} from "lucide-react";
import { getAllCustomers, deleteCustomer } from "../../services/userService";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../common/ToastContainer";
import ConfirmModal from "../common/ConfirmModal";

const UsersComponent = () => {
  const [customers, setCustomers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toast = useToast();

  // View modal state
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    customer: null,
  });

  // Delete confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    customerId: null,
    customerName: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setFetchLoading(true);
      const response = await getAllCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers. Please refresh the page.");
    } finally {
      setFetchLoading(false);
    }
  };

  // Filter customers by search
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery),
  );

  // Open view modal
  const openViewModal = (customer) => {
    setViewModal({ isOpen: true, customer });
  };

  // Close view modal
  const closeViewModal = () => {
    setViewModal({ isOpen: false, customer: null });
  };

  // Open delete modal
  const openDeleteModal = (customer) => {
    setConfirmModal({
      isOpen: true,
      customerId: customer.id,
      customerName: customer.name,
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setConfirmModal({
      isOpen: false,
      customerId: null,
      customerName: "",
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      const response = await deleteCustomer(confirmModal.customerId);
      toast.success(response.message || "Customer deleted successfully!");
      await fetchCustomers();
      closeDeleteModal();
      // Close view modal too if the deleted user was being viewed
      if (viewModal.customer?.id === confirmModal.customerId) {
        closeViewModal();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error(error.message || "Failed to delete customer.");
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message={`Are you sure you want to delete "${confirmModal.customerName}"? This action cannot be undone and will permanently remove their account and all associated data.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />

      {/* View Customer Modal */}
      <AnimatePresence>
        {viewModal.isOpen && viewModal.customer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 relative">
                <button
                  onClick={closeViewModal}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="flex flex-col items-center">
                  {viewModal.customer.profile_photo ? (
                    <img
                      src={viewModal.customer.profile_photo}
                      alt={viewModal.customer.name}
                      className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold">
                        {getInitials(viewModal.customer.name)}
                      </span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mt-3">
                    {viewModal.customer.name}
                  </h3>
                  <span className="mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white">
                    Customer
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Email */}
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Mail className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {viewModal.customer.email}
                    </p>
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Phone className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Mobile</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {viewModal.customer.mobile}
                    </p>
                  </div>
                  {/* Mobile verified badge */}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      viewModal.customer.is_mobile_verified
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {viewModal.customer.is_mobile_verified
                      ? "✓ Verified"
                      : "Unverified"}
                  </span>
                </div>

                {/* Email Verified */}
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    {viewModal.customer.is_verified ? (
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    ) : (
                      <Shield className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Account Status
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Email Verification
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      viewModal.customer.is_verified
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {viewModal.customer.is_verified
                      ? "✓ Verified"
                      : "Unverified"}
                  </span>
                </div>

                {/* Member Since */}
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Member Since
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(viewModal.customer.created_at)}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    closeViewModal();
                    openDeleteModal(viewModal.customer);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 hover:border-red-300 px-4 py-3 rounded-xl font-semibold transition-all duration-300 mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Customer</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Customer Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View and manage registered customers
          </p>
        </div>

        {/* Stats Badge */}
        <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          <Users className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-semibold text-orange-700">
            {customers.length} Total Customer{customers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      {!fetchLoading && customers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or mobile..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors text-sm"
          />
        </div>
      )}

      {/* Loading State */}
      {fetchLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm sm:text-base">
            Loading customers...
          </p>
        </div>
      ) : customers.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center"
        >
          <UserX
            size={48}
            className="mx-auto text-gray-300 mb-4 sm:w-16 sm:h-16"
          />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
            No Customers Yet
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Registered customers will appear here.
          </p>
        </motion.div>
      ) : filteredCustomers.length === 0 ? (
        /* No Search Results */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-lg shadow-md p-8 text-center"
        >
          <Search size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-600 mb-1">
            No results for "{searchQuery}"
          </h3>
          <p className="text-sm text-gray-500">
            Try searching by a different name, email, or mobile number.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto overflow-y-auto max-h-[420px]">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    Mobile
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-sm">
                    Email Verified
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-sm">
                    Mobile Verified
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-sm w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {customer.profile_photo ? (
                          <img
                            src={customer.profile_photo}
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-orange-300"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {getInitials(customer.name)}
                            </span>
                          </div>
                        )}
                        <span className="font-semibold text-gray-800 text-sm">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.email}
                    </td>

                    {/* Mobile */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.mobile}
                    </td>

                    {/* Email Verified */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.is_verified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {customer.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    {/* Mobile Verified */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          customer.is_mobile_verified
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {customer.is_mobile_verified
                          ? "Verified"
                          : "Unverified"}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(customer.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openViewModal(customer)}
                          className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openDeleteModal(customer)}
                          disabled={loading}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-200 max-h-[440px] overflow-y-auto">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {customer.profile_photo ? (
                    <img
                      src={customer.profile_photo}
                      alt={customer.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-orange-300 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {getInitials(customer.name)}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">
                      {customer.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {customer.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          customer.is_verified
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {customer.is_verified ? "Email ✓" : "Email ✗"}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          customer.is_mobile_verified
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {customer.is_mobile_verified ? "Mobile ✓" : "Mobile ✗"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openViewModal(customer)}
                      className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeleteModal(customer)}
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
      )}
    </div>
  );
};

export default UsersComponent;
