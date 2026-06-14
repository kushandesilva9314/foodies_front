import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  ExternalLink,
  Package,
  DollarSign,
  Hash,
  AlertCircle,
} from "lucide-react";

// ── Dummy Data ────────────────────────────────────────────────────────────────
const DUMMY_ACTIVE_ORDERS = [
  {
    id: "ORD-2024-001",
    date: "2024-06-10T10:30:00",
    status: "placed",
    total: 2450.0,
    items: [
      { item_no: "ITM-001", name: "Chicken Kottu", quantity: 2, price: 850.0 },
      { item_no: "ITM-004", name: "Mango Lassi", quantity: 1, price: 350.0 },
      { item_no: "ITM-007", name: "Garlic Naan", quantity: 2, price: 200.0 },
    ],
  },
  {
    id: "ORD-2024-002",
    date: "2024-06-09T14:15:00",
    status: "preparing",
    total: 1800.0,
    items: [
      { item_no: "ITM-002", name: "Beef Burger", quantity: 1, price: 950.0 },
      { item_no: "ITM-005", name: "French Fries", quantity: 2, price: 425.0 },
    ],
  },
  {
    id: "ORD-2024-003",
    date: "2024-06-08T18:45:00",
    status: "on_the_way",
    total: 3200.0,
    items: [
      {
        item_no: "ITM-003",
        name: "Margherita Pizza",
        quantity: 1,
        price: 1800.0,
      },
      { item_no: "ITM-006", name: "Caesar Salad", quantity: 1, price: 750.0 },
      {
        item_no: "ITM-008",
        name: "Chocolate Lava Cake",
        quantity: 2,
        price: 325.0,
      },
    ],
  },
  {
    id: "ORD-2024-004",
    date: "2024-06-07T12:00:00",
    status: "delivered",
    total: 1550.0,
    items: [
      { item_no: "ITM-001", name: "Chicken Kottu", quantity: 1, price: 850.0 },
      { item_no: "ITM-009", name: "Iced Tea", quantity: 2, price: 350.0 },
    ],
  },
  {
    id: "ORD-2024-005",
    date: "2024-06-06T09:20:00",
    status: "cancelled",
    total: 900.0,
    items: [
      { item_no: "ITM-010", name: "Egg Fried Rice", quantity: 2, price: 450.0 },
    ],
  },
];

const DUMMY_STATS = {
  totalOrders: 24,
  totalSpent: 38450.0,
  activeOrders: 3,
};

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  placed: {
    label: "Order Placed",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
    iconColor: "text-blue-500",
    canCancel: true,
  },
  preparing: {
    label: "Preparing",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: ChefHat,
    iconColor: "text-orange-500",
    canCancel: false,
  },
  on_the_way: {
    label: "On the Way",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Truck,
    iconColor: "text-purple-500",
    canCancel: false,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-500",
    canCancel: false,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: XCircle,
    iconColor: "text-red-500",
    canCancel: false,
  },
};

// ── Cancel Confirmation Modal ─────────────────────────────────────────────────
const CancelModal = ({ isOpen, onClose, onConfirm, orderId, loading }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Cancel Order</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-1">
              Are you sure you want to cancel
            </p>
            <p className="font-bold text-gray-800 mb-4">{orderId}?</p>
            <p className="text-xs text-gray-500 mb-6">
              This action cannot be undone. Once cancelled, your order will not
              be processed.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              >
                Keep Order
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Order Card ────────────────────────────────────────────────────────────────
const OrderCard = ({ order, index, onCancelRequest }) => {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[order.status];
  const StatusIcon = config.icon;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border-2 border-orange-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Priority indicator strip for placed orders */}
      {order.status === "placed" && (
        <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-red-500" />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left */}
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div
              className={`p-2.5 rounded-xl flex-shrink-0 ${
                order.status === "placed" ? "bg-orange-100" : "bg-gray-50"
              }`}
            >
              <ShoppingBag
                className={`w-5 h-5 ${
                  order.status === "placed"
                    ? "text-orange-500"
                    : "text-gray-400"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-sm sm:text-base">
                {order.id}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDate(order.date)}
              </p>
              <p className="text-sm font-semibold text-orange-600 mt-1">
                LKR {order.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
            >
              <StatusIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
              <span>{config.label}</span>
            </span>
            {config.canCancel && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onCancelRequest(order)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-3 py-1 rounded-full transition-all"
              >
                Cancel Order
              </motion.button>
            )}
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-between text-xs text-gray-400 hover:text-orange-500 transition-colors group pt-3 border-t border-gray-100"
        >
          <span className="flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5" />
            <span>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
          </span>
          <span className="flex items-center space-x-1">
            <span>{expanded ? "Hide items" : "View items"}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </button>
      </div>

      {/* Expanded Items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-orange-100 bg-gradient-to-b from-orange-50/50 to-white px-4 sm:px-5 py-4 space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 border-b border-orange-100">
                <span className="col-span-2">Item No</span>
                <span className="col-span-5">Name</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Price</span>
              </div>
              {order.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-12 gap-2 text-xs sm:text-sm items-center py-1.5"
                >
                  <span className="col-span-2 font-mono text-gray-400 text-xs truncate">
                    {item.item_no}
                  </span>
                  <span className="col-span-5 font-medium text-gray-700 truncate">
                    {item.name}
                  </span>
                  <span className="col-span-2 text-center">
                    <span className="inline-block bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full text-xs">
                      x{item.quantity}
                    </span>
                  </span>
                  <span className="col-span-3 text-right font-semibold text-gray-700 text-xs">
                    LKR {(item.price * item.quantity).toFixed(2)}
                  </span>
                </motion.div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-orange-100">
                <span className="text-xs font-semibold text-gray-500">
                  Order Total
                </span>
                <span className="text-sm font-bold text-orange-600">
                  LKR {order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const OrderSummary = () => {
  const [orders, setOrders] = useState(DUMMY_ACTIVE_ORDERS);
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    order: null,
  });
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancelRequest = (order) =>
    setCancelModal({ isOpen: true, order });
  const handleCancelClose = () =>
    setCancelModal({ isOpen: false, order: null });

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelModal.order.id ? { ...o, status: "cancelled" } : o,
      ),
    );
    setCancelLoading(false);
    handleCancelClose();
  };

  // Separate active (placed/preparing/on_the_way) from recently completed
  const activeOrders = orders.filter((o) =>
    ["placed", "preparing", "on_the_way"].includes(o.status),
  );
  const recentOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status),
  );

  return (
    <div className="space-y-8">
      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        orderId={cancelModal.order?.id}
        loading={cancelLoading}
      />

      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            My Orders
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your orders and view your order history
          </p>
        </div>
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="/orders"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <span>Full History</span>
          <ExternalLink className="w-4 h-4" />
        </motion.a>
      </div>

      {/* ── PRIORITY: Active Orders ── */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Subsection Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-sm">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Active Orders</h3>
            <p className="text-xs text-gray-500">
              Orders currently being processed
            </p>
          </div>
          {activeOrders.length > 0 && (
            <span className="ml-auto text-xs font-bold bg-orange-500 text-white px-2.5 py-1 rounded-full">
              {activeOrders.length}
            </span>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-400">
              No active orders
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Your active orders will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                onCancelRequest={handleCancelRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Completed Orders ── */}
      {recentOrders.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-200 rounded-xl">
              <CheckCircle className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-700">
                Recently Completed
              </h3>
              <p className="text-xs text-gray-400">
                Delivered and cancelled orders — removed after 3 days
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                onCancelRequest={handleCancelRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Order Overview (Stats + History Link) ── */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Order Overview</h3>
            <p className="text-xs text-orange-100 mt-0.5">
              Your overall ordering activity
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/orders"
            className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all border border-white/20"
          >
            <span>View Full History</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-100 font-medium">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-white">
                  {DUMMY_STATS.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-100 font-medium">
                  Total Spent
                </p>
                <p className="text-lg font-bold text-white">
                  LKR {DUMMY_STATS.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-orange-100 font-medium">
                  Active Now
                </p>
                <p className="text-2xl font-bold text-white">
                  {DUMMY_STATS.activeOrders}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
