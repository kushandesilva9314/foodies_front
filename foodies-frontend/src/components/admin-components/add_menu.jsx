import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Upload,
  Image as ImageIcon,
  Search,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  createMenuCategory,
  updateMenuCategory,
  deleteMenuCategory,
} from "../../services/menuService";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../common/ToastContainer";
import ConfirmModal from "../common/ConfirmModal";

// ---------- Sortable row for a menu itself ----------
const SortableMenuRow = ({
  menu,
  menus,
  loading,
  isDragDisabled,
  isExpanded,
  handleMoveMenu,
  handleUpdate,
  openDeleteModal,
  toggleExpand,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: menu.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 transition-colors bg-white"
    >
      <td className="px-2 py-3 sm:py-4 text-center">
        {!isDragDisabled && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
            title="Drag to reorder"
          >
            <GripVertical size={18} />
          </button>
        )}
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => handleMoveMenu(menu, "up")}
            disabled={menu.position === 1}
            className="text-gray-500 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            ▲
          </button>
          <span className="font-semibold text-gray-700 text-sm">
            {menu.position}
          </span>
          <button
            type="button"
            onClick={() => handleMoveMenu(menu, "down")}
            disabled={menu.position === menus.length}
            className="text-gray-500 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            ▼
          </button>
        </div>
      </td>
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
            onClick={() => toggleExpand(menu.id)}
            disabled={loading}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 text-xs sm:text-sm font-medium"
            title="Manage Categories"
          >
            <FolderOpen size={16} />
            <span className="hidden sm:inline">Categories</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </motion.button>
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
    </tr>
  );
};

// ---------- Sortable row for a category within a menu's expanded panel ----------
const SortableCategoryRow = ({
  category,
  categories,
  loading,
  handleMoveCategory,
  handleEditCategory,
  openDeleteCategoryModal,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none flex-shrink-0"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => handleMoveCategory(category, "up")}
          disabled={category.position === 1}
          className="text-gray-400 hover:text-orange-600 disabled:opacity-30 text-xs"
        >
          ▲
        </button>
        <span className="font-semibold text-gray-600 text-xs">
          {category.position}
        </span>
        <button
          type="button"
          onClick={() => handleMoveCategory(category, "down")}
          disabled={category.position === categories.length}
          className="text-gray-400 hover:text-orange-600 disabled:opacity-30 text-xs"
        >
          ▼
        </button>
      </div>
      <img
        src={category.image}
        alt={category.name}
        className="h-10 w-10 object-cover rounded-lg border border-orange-200 flex-shrink-0"
      />
      <span className="font-medium text-gray-800 text-sm flex-1 truncate">
        {category.name}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => handleEditCategory(category)}
          disabled={loading}
          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => openDeleteCategoryModal(category)}
          disabled={loading}
          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// ---------- Category management panel (rendered under an expanded menu) ----------
// NOTE: This was previously defined *inside* AddMenu's component body, which meant
// it got recreated as a brand-new component reference on every render (including
// every keystroke, since typing updates state -> re-render -> redefinition).
// React then treated it as a totally different component, unmounted the old input,
// and mounted a fresh one -> lost focus, only one character registered per click.
// Moving it out here and passing everything in as props fixes that.
const CategoryPanel = ({
  menu,
  menuCategories,
  categoryFormOpen,
  editingCategory,
  categoryName,
  setCategoryName,
  categoryPosition,
  setCategoryPosition,
  categoryImagePreview,
  categoryLoading,
  categorySensors,
  openAddCategoryForm,
  handleEditCategory,
  closeCategoryForm,
  handleCategoryImageChange,
  isDuplicateCategory,
  handleCategorySubmit,
  openDeleteCategoryModal,
  handleMoveCategory,
  handleCategoryDragEnd,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-50 border-t-2 border-orange-200 overflow-hidden"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-700 text-sm">
            Categories in "{menu.name}"
          </h4>
          {!categoryFormOpen && (
            <button
              type="button"
              onClick={() => openAddCategoryForm(menu)}
              className="flex items-center gap-1 text-xs sm:text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus size={14} />
              Add Category
            </button>
          )}
        </div>

        {/* Category add/edit form */}
        {categoryFormOpen && (
          <div className="bg-white border-2 border-orange-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h5 className="font-semibold text-gray-700 text-sm">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h5>
              <button type="button" onClick={closeCategoryForm} className="text-gray-500 hover:text-red-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => handleCategorySubmit(e, menu)} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  required
                  disabled={categoryLoading}
                />
                {categoryName.trim() && isDuplicateCategory(menu, categoryName) && (
                  <p className="text-red-600 text-xs mt-1">
                    ⚠️ A category with this name already exists in this menu
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Position * (1 = shows first)
                </label>
                <input
                  type="text"
                  value={categoryPosition}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*$/.test(value)) setCategoryPosition(value);
                  }}
                  placeholder={`1 to ${editingCategory ? menuCategories.length : menuCategories.length + 1}`}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                  required
                  disabled={categoryLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Image * (PNG, JPEG, JPG)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg border-2 border-gray-300 transition-colors">
                      <Upload size={14} className="text-gray-600" />
                      <span className="text-gray-700 text-xs font-medium">Choose Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleCategoryImageChange}
                      className="hidden"
                      disabled={categoryLoading}
                    />
                  </label>
                  {categoryImagePreview ? (
                    <img
                      src={categoryImagePreview}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded-lg border-2 border-orange-400"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <ImageIcon size={18} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={categoryLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {categoryLoading ? "Saving..." : editingCategory ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={closeCategoryForm}
                  disabled={categoryLoading}
                  className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category list */}
        {menuCategories.length > 0 ? (
          <DndContext
            sensors={categorySensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd(menu)}
          >
            <SortableContext
              items={menuCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {menuCategories.map((category) => (
                  <SortableCategoryRow
                    key={category.id}
                    category={category}
                    categories={menuCategories}
                    loading={categoryLoading}
                    handleMoveCategory={(cat, dir) => handleMoveCategory(menu, cat, dir)}
                    handleEditCategory={handleEditCategory}
                    openDeleteCategoryModal={(cat) => openDeleteCategoryModal(menu, cat)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          !categoryFormOpen && (
            <p className="text-sm text-gray-400 italic text-center py-4">
              No categories yet in this menu.
            </p>
          )
        )}
      </div>
    </motion.div>
  );
};

const AddMenu = () => {
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState("");
  const [expandedMenuId, setExpandedMenuId] = useState(null);

  const toast = useToast();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    menuId: null,
    menuName: "",
  });

  // Menu form state
  const [menuName, setMenuName] = useState("");
  const [menuImage, setMenuImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Category form state (scoped to whichever menu is expanded)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryPosition, setCategoryPosition] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryConfirmModal, setCategoryConfirmModal] = useState({
    isOpen: false,
    menuId: null,
    categoryId: null,
    categoryName: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const categorySensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setFetchLoading(true);
      const response = await getAllMenus();
      setMenus(response.data || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast.error("Failed to load menus. Please refresh the page.");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchMenusQuiet = async () => {
    try {
      const response = await getAllMenus();
      setMenus(response.data || []);
    } catch (error) {
      console.error("Error refreshing menus:", error);
    }
  };

  const nextPosition = menus.length + 1;

  const filteredMenus = menus.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isDragDisabled = searchQuery.trim().length > 0;

  const toggleExpand = (menuId) => {
    setExpandedMenuId((prev) => (prev === menuId ? null : menuId));
    setCategoryFormOpen(false);
    setEditingCategory(null);
  };

  // ---------- Menu image ----------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg")
    ) {
      setMenuImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.warning("Please upload a valid image (PNG, JPEG, JPG)");
    }
  };

  const isDuplicateMenu = (name) => {
    const trimmedName = name.trim().toLowerCase();
    return menus.some(
      (menu) =>
        menu.name.toLowerCase() === trimmedName &&
        (!editingMenu || menu.id !== editingMenu.id),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!menuName.trim() || (!editingMenu && !menuImage)) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (isDuplicateMenu(menuName)) {
      toast.error(`A menu with the name "${menuName.trim()}" already exists`);
      return;
    }

    if (!editingMenu) {
      const posNum = parseInt(position, 10);
      if (!position || isNaN(posNum) || posNum < 1 || posNum > menus.length + 1) {
        toast.error(`Position must be between 1 and ${menus.length + 1}`);
        return;
      }
    }

    setLoading(true);

    try {
      const menuData = {
        name: menuName.trim(),
        image: menuImage,
        ...(editingMenu ? {} : { position: position }),
      };

      if (editingMenu) {
        const response = await updateMenu(editingMenu.id, menuData);
        toast.success(response.message || "Menu updated successfully!");
        await fetchMenus();
      } else {
        const response = await createMenu(menuData);
        toast.success(response.message || "Menu created successfully!");
        await fetchMenus();
      }

      resetForm();
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error(error.message || "Failed to save menu");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMenuName("");
    setMenuImage(null);
    setImagePreview(null);
    setPosition("");
    setShowForm(false);
    setEditingMenu(null);
  };

  const openDeleteModal = (menu) => {
    setConfirmModal({ isOpen: true, menuId: menu.id, menuName: menu.name });
  };

  const closeDeleteModal = () => {
    setConfirmModal({ isOpen: false, menuId: null, menuName: "" });
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      const response = await deleteMenu(confirmModal.menuId);
      toast.success(response.message || "Menu deleted successfully!");
      if (expandedMenuId === confirmModal.menuId) setExpandedMenuId(null);
      await fetchMenus();
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast.error(error.message || "Failed to delete menu");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (menu) => {
    setEditingMenu(menu);
    setMenuName(menu.name);
    setImagePreview(menu.image);
    setPosition(menu.position?.toString() || "");
    setShowForm(true);
  };

  const handleMoveMenu = async (menu, direction) => {
    const newPosition = direction === "up" ? menu.position - 1 : menu.position + 1;
    if (newPosition < 1 || newPosition > menus.length) return;

    const neighbor = menus.find((m) => m.position === newPosition);
    if (!neighbor) return;

    setMenus((prev) =>
      prev
        .map((m) => {
          if (m.id === menu.id) return { ...m, position: newPosition };
          if (m.id === neighbor.id) return { ...m, position: menu.position };
          return m;
        })
        .sort((a, b) => a.position - b.position),
    );

    try {
      await updateMenu(menu.id, { name: menu.name, position: newPosition });
    } catch (error) {
      console.error("Error reordering menu:", error);
      toast.error(error.message || "Failed to reorder menu");
      await fetchMenusQuiet();
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const draggedMenu = menus[oldIndex];
    const newPosition = newIndex + 1;

    const reordered = arrayMove(menus, oldIndex, newIndex).map((m, i) => ({
      ...m,
      position: i + 1,
    }));
    setMenus(reordered);

    try {
      await updateMenu(draggedMenu.id, { name: draggedMenu.name, position: newPosition });
    } catch (error) {
      console.error("Error reordering menu:", error);
      toast.error(error.message || "Failed to reorder menu");
      await fetchMenusQuiet();
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  // ---------- Category management ----------
  const getMenuCategories = (menu) =>
    (menu?.categories || []).slice().sort((a, b) => a.position - b.position);

  const openAddCategoryForm = (menu) => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setCategoryImagePreview(null);
    setCategoryPosition((getMenuCategories(menu).length + 1).toString());
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryImagePreview(category.image);
    setCategoryImage(null);
    setCategoryPosition(category.position?.toString() || "");
    setCategoryFormOpen(true);
  };

  const closeCategoryForm = () => {
    setCategoryFormOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setCategoryImagePreview(null);
    setCategoryPosition("");
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg")
    ) {
      setCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setCategoryImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      toast.warning("Please upload a valid image (PNG, JPEG, JPG)");
    }
  };

  const isDuplicateCategory = (menu, name) => {
    const trimmedName = name.trim().toLowerCase();
    return getMenuCategories(menu).some(
      (c) =>
        c.name.toLowerCase() === trimmedName &&
        (!editingCategory || c.id !== editingCategory.id),
    );
  };

  const handleCategorySubmit = async (e, menu) => {
    e.preventDefault();

    if (!categoryName.trim() || (!editingCategory && !categoryImage)) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (isDuplicateCategory(menu, categoryName)) {
      toast.error(`A category named "${categoryName.trim()}" already exists in this menu`);
      return;
    }

    const menuCategories = getMenuCategories(menu);
    const maxAllowed = editingCategory ? menuCategories.length : menuCategories.length + 1;
    const posNum = parseInt(categoryPosition, 10);
    if (!categoryPosition || isNaN(posNum) || posNum < 1 || posNum > maxAllowed) {
      toast.error(`Position must be between 1 and ${maxAllowed}`);
      return;
    }

    setCategoryLoading(true);

    try {
      const categoryData = {
        name: categoryName.trim(),
        image: categoryImage,
        position: categoryPosition,
      };

      if (editingCategory) {
        const response = await updateMenuCategory(menu.id, editingCategory.id, categoryData);
        toast.success(response.message || "Category updated successfully!");
      } else {
        const response = await createMenuCategory(menu.id, categoryData);
        toast.success(response.message || "Category created successfully!");
      }

      await fetchMenus();
      closeCategoryForm();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.message || "Failed to save category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const openDeleteCategoryModal = (menu, category) => {
    setCategoryConfirmModal({
      isOpen: true,
      menuId: menu.id,
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const closeDeleteCategoryModal = () => {
    setCategoryConfirmModal({ isOpen: false, menuId: null, categoryId: null, categoryName: "" });
  };

  const handleDeleteCategoryConfirm = async () => {
    setCategoryLoading(true);
    try {
      const response = await deleteMenuCategory(
        categoryConfirmModal.menuId,
        categoryConfirmModal.categoryId,
      );
      toast.success(response.message || "Category deleted successfully!");
      await fetchMenus();
      closeDeleteCategoryModal();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleMoveCategory = async (menu, category, direction) => {
    const categories = getMenuCategories(menu);
    const newPosition = direction === "up" ? category.position - 1 : category.position + 1;
    if (newPosition < 1 || newPosition > categories.length) return;

    const neighbor = categories.find((c) => c.position === newPosition);
    if (!neighbor) return;

    setMenus((prev) =>
      prev.map((m) => {
        if (m.id !== menu.id) return m;
        return {
          ...m,
          categories: m.categories.map((c) => {
            if (c.id === category.id) return { ...c, position: newPosition };
            if (c.id === neighbor.id) return { ...c, position: category.position };
            return c;
          }),
        };
      }),
    );

    try {
      await updateMenuCategory(menu.id, category.id, {
        name: category.name,
        position: newPosition,
      });
    } catch (error) {
      console.error("Error reordering category:", error);
      toast.error(error.message || "Failed to reorder category");
      await fetchMenusQuiet();
    }
  };

  const handleCategoryDragEnd = (menu) => async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const categories = getMenuCategories(menu);
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const dragged = categories[oldIndex];
    const newPosition = newIndex + 1;
    const reordered = arrayMove(categories, oldIndex, newIndex).map((c, i) => ({
      ...c,
      position: i + 1,
    }));

    setMenus((prev) =>
      prev.map((m) => (m.id === menu.id ? { ...m, categories: reordered } : m)),
    );

    try {
      await updateMenuCategory(menu.id, dragged.id, {
        name: dragged.name,
        position: newPosition,
      });
    } catch (error) {
      console.error("Error reordering category:", error);
      toast.error(error.message || "Failed to reorder category");
      await fetchMenusQuiet();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Menu"
        message={`Are you sure you want to delete "${confirmModal.menuName}"? This will also delete all categories inside it. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />

      <ConfirmModal
        isOpen={categoryConfirmModal.isOpen}
        onClose={closeDeleteCategoryModal}
        onConfirm={handleDeleteCategoryConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryConfirmModal.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={categoryLoading}
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Menu Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Add and manage your restaurant menus and their categories
          </p>
        </div>
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setPosition(nextPosition.toString());
              setShowForm(true);
            }}
            disabled={loading}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base disabled:opacity-50"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>Add Menu</span>
          </motion.button>
        )}
      </div>

      {!fetchLoading && menus.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by menu name..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors text-sm"
          />
          {isDragDisabled && (
            <p className="text-xs text-gray-500 mt-1">Clear the search to reorder menus.</p>
          )}
        </div>
      )}

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

            {editingMenu ? (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Display Position
                </label>
                <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                  #{editingMenu.position} — use the arrows or drag rows in the table to reorder
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Display Position * (1 = shows first)
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*$/.test(value)) setPosition(value);
                  }}
                  placeholder={`1 to ${menus.length + 1}`}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers appear first on the home page.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Menu Image * (PNG, JPEG, JPG)
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <label className="w-full sm:w-auto flex-shrink-0 cursor-pointer">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-300 transition-colors">
                    <Upload size={18} className="text-gray-600 sm:w-5 sm:h-5" />
                    <span className="text-gray-700 font-medium text-sm sm:text-base">
                      Choose Image
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
          <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-red-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3 sm:py-4 w-8"></th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base w-16">
                    #
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold text-sm sm:text-base">
                    Menu
                  </th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold text-sm sm:text-base w-56 sm:w-64">
                    Action
                  </th>
                </tr>
              </thead>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredMenus.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-gray-200">
                    {filteredMenus.map((menu) => (
                      <React.Fragment key={menu.id}>
                        <SortableMenuRow
                          menu={menu}
                          menus={menus}
                          loading={loading}
                          isDragDisabled={isDragDisabled}
                          isExpanded={expandedMenuId === menu.id}
                          handleMoveMenu={handleMoveMenu}
                          handleUpdate={handleUpdate}
                          openDeleteModal={openDeleteModal}
                          toggleExpand={toggleExpand}
                        />
                        {expandedMenuId === menu.id && (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <AnimatePresence>
                                <CategoryPanel
                                  menu={menu}
                                  menuCategories={getMenuCategories(menu)}
                                  categoryFormOpen={categoryFormOpen}
                                  editingCategory={editingCategory}
                                  categoryName={categoryName}
                                  setCategoryName={setCategoryName}
                                  categoryPosition={categoryPosition}
                                  setCategoryPosition={setCategoryPosition}
                                  categoryImagePreview={categoryImagePreview}
                                  categoryLoading={categoryLoading}
                                  categorySensors={categorySensors}
                                  openAddCategoryForm={openAddCategoryForm}
                                  handleEditCategory={handleEditCategory}
                                  closeCategoryForm={closeCategoryForm}
                                  handleCategoryImageChange={handleCategoryImageChange}
                                  isDuplicateCategory={isDuplicateCategory}
                                  handleCategorySubmit={handleCategorySubmit}
                                  openDeleteCategoryModal={openDeleteCategoryModal}
                                  handleMoveCategory={handleMoveCategory}
                                  handleCategoryDragEnd={handleCategoryDragEnd}
                                />
                              </AnimatePresence>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>

          {/* Mobile Card View — arrows only, expandable category panel below each card */}
          <div className="sm:hidden divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {filteredMenus.map((menu) => (
              <div key={menu.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveMenu(menu, "up")}
                        disabled={menu.position === 1}
                        className="text-gray-400 hover:text-orange-600 disabled:opacity-30 text-xs"
                      >
                        ▲
                      </button>
                      <span className="font-semibold text-gray-700 text-xs">
                        {menu.position}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveMenu(menu, "down")}
                        disabled={menu.position === menus.length}
                        className="text-gray-400 hover:text-orange-600 disabled:opacity-30 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="h-16 w-16 object-cover rounded-lg border-2 border-orange-300 shadow-sm flex-shrink-0"
                    />
                    <span className="font-semibold text-gray-800 text-base truncate flex-1">
                      {menu.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(menu.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      <FolderOpen size={14} />
                      Categories
                      {expandedMenuId === menu.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(menu)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(menu)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
                {expandedMenuId === menu.id && (
                  <AnimatePresence>
                    <CategoryPanel
                      menu={menu}
                      menuCategories={getMenuCategories(menu)}
                      categoryFormOpen={categoryFormOpen}
                      editingCategory={editingCategory}
                      categoryName={categoryName}
                      setCategoryName={setCategoryName}
                      categoryPosition={categoryPosition}
                      setCategoryPosition={setCategoryPosition}
                      categoryImagePreview={categoryImagePreview}
                      categoryLoading={categoryLoading}
                      categorySensors={categorySensors}
                      openAddCategoryForm={openAddCategoryForm}
                      handleEditCategory={handleEditCategory}
                      closeCategoryForm={closeCategoryForm}
                      handleCategoryImageChange={handleCategoryImageChange}
                      isDuplicateCategory={isDuplicateCategory}
                      handleCategorySubmit={handleCategorySubmit}
                      openDeleteCategoryModal={openDeleteCategoryModal}
                      handleMoveCategory={handleMoveCategory}
                      handleCategoryDragEnd={handleCategoryDragEnd}
                    />
                  </AnimatePresence>
                )}
              </div>
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