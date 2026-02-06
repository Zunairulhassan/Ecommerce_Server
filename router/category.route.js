import express from "express";
import upload from "../middleWere/multer.js";
import auth from "../middleWere/auth.js";

// Import Category controllers (deleteCategory is from Category.controller.js)
import {
  uploadedImages,
  createCategory,
  getCategories,
  getCategoriesCount,
  getSubCategoriesCount,
  getCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/Category.controller.js";

// Utility controller (image removal endpoint kept in user.controller.js)
import { removeImageFromCloudinary } from "../controllers/user.controller.js";

const router = express.Router();

// Upload category images
router.post("/upload", auth, upload.array("images"), uploadedImages);

// Create category (send image URLs returned from upload)
router.post("/create", auth, createCategory);

// Get all categories (tree structure)
router.get("/get", getCategories);
router.get("/get/count", getCategoriesCount);
router.get("/get/count/subCat", getSubCategoriesCount);

// Get single category
router.get("/:id", getCategory);

// Delete a single image (cloudinary) — kept in user.controller
router.delete("/deleteImage", auth, removeImageFromCloudinary);

// Delete category (and its nested subcategories & images)
router.delete("/:id", auth, deleteCategory);
router.put("/:id", auth, updateCategory);

export default router;
