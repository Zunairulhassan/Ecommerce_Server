import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import CategoryModel from "../Models/category.model.js";
import { error } from "console";

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

// ✅ Upload Images Controller
export async function uploadedImages(request, response) {
  try {
    const images = request.files; // Multer uploads
    const uploadedImages = [];

    if (!images || images.length === 0) {
      return response.status(400).json({
        message: "Please upload at least one image.",
        success: false,
      });
    }

    // ✅ Check if Cloudinary is configured
    if (!process.env.cloudinary_Config_Cloud_name) {
      console.error("❌ Cloudinary not configured - missing cloud_name");
      return response.status(500).json({
        message: "Server configuration error - Cloudinary not setup",
        success: false,
      });
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      folder: "categories", // optional: store inside "categories/" folder in Cloudinary
    };

    // ✅ Upload images to Cloudinary
    for (let i = 0; i < images.length; i++) {
      try {
        const result = await cloudinary.uploader.upload(images[i].path, options);
        uploadedImages.push(result.secure_url);

        // ✅ Remove temp file after upload
        if (fs.existsSync(images[i].path)) {
          fs.unlinkSync(images[i].path);
        }
      } catch (uploadError) {
        console.error(`❌ Cloudinary upload failed for file ${i}:`, uploadError.message);
        throw uploadError;
      }
    }

    // ✅ Return uploaded image URLs
    return response.status(201).json({
      message: "Images uploaded successfully!",
      success: true,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return response.status(500).json({
      message: "Something went wrong while uploading images",
      error: error.message,
      success: false,
    });
  }
}

// ✅ Create Category Controller
export async function createCategory(request, response) {
  try {
    // ✅ Expecting image URLs from frontend (already uploaded to Cloudinary)
    const { name, parentId, parentsCatName, images } = request.body;

    if (!name) {
      return response.status(400).json({
        message: "Category name is required.",
        success: false,
      });
    }

    const category = new CategoryModel({
      name,
      images: Array.isArray(images) ? images : [images], // handles both single or multiple images
      parentId: parentId || null,
      parentsCatName: parentsCatName || null,
    });

    const savedCategory = await category.save();

    return response.status(201).json({
      message: "Category created successfully!",
      success: true,
      category: savedCategory,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong while creating category",
      error: error.message,
      success: false,
    });
  }
}

// ✅ Get Categories Controller (Tree format)
export async function getCategories(request, response) {
  try {
    const categories = await CategoryModel.find();
    const categoryMap = {};

    // Build a map of all categories
    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat._doc, children: [] };
    });

    const rootCategories = [];

    // Connect children to their parent categories
    categories.forEach((cat) => {
      if (cat.parentId) {
        if (categoryMap[cat.parentId]) {
          categoryMap[cat.parentId].children.push(categoryMap[cat._id]);
        }
      } else {
        rootCategories.push(categoryMap[cat._id]);
      }
    });

    return response.status(200).json({
      error: false,
      success: true,
      data: rootCategories,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong while fetching categories",
      error: error.message,
      success: false,
    });
  }
}

// ✅ Get category count
export async function getCategoriesCount(request, response) {
  try {
    const categoryCount = await CategoryModel.countDocuments({ presentId: undefined });

    if (!categoryCount) {
      response.status(500).json({ success: false, error: true });
    } else {
      response.send({ categoryCount: categoryCount });
    }
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong while fetching category count",
      error: error.message,
      success: false,
    });
  }
}

// ✅ Get subcategory count
export async function getSubCategoriesCount(request, response) {
  try {
    const categories = await CategoryModel.find();

    // Check if categories exist
    if (!categories || categories.length === 0) {
      return response.status(404).json({
        message: "No categories found",
        success: false,
        error: true,
      });
    }

    // Filter only subcategories (those with a valid parentId)
    const subCatList = categories.filter(
      (cat) => cat.parentId !== undefined && cat.parentId !== null && cat.parentId !== ""
    );

    // Send count response
    return response.status(200).json({
      subCategoryCount: subCatList.length,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong while fetching subcategory count",
      error: error.message,
      success: false,
    });
  }
}

// ✅ Get single category by ID
export async function getCategory(request, response) {
  try {
    const category = await CategoryModel.findById(request.params.id);
    if (!category) {
      return response.status(500).json({
        message: "The category with the given ID was not found.",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      category: category,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong while fetching the category",
      error: error.message,
      success: false,
    });
  }
}

// ✅ Delete Category Controller
export async function deleteCategory(request, response) {
  try {
    const category = await CategoryModel.findById(request.params.id);

    if (!category) {
      return response.status(404).json({
        message: "Category not found",
        success: false,
        error: true,
      });
    }

    const images = category.images || [];

    for (let img of images) {
      if (!img) continue; // ✅ skip null or undefined

      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imagesName = image.split(".")[0];

      if (imagesName) {
        cloudinary.uploader.destroy(imagesName, (error, result) => {
          // console.log(error, result);
        });
      }
      if (res) {
        return response.status(200).json({
          error: false,
          success:true,
          message:"image deleted successfully"
        })
      }

    }

    const subCategory = await CategoryModel.find({ parentID: request.params.id });

    let thirdsubCategory = [];
    for (let i = 0; i < subCategory.length; i++) {
      const third = await CategoryModel.find({ parentID: subCategory[i]._id });
      thirdsubCategory = [...thirdsubCategory, ...third];
    }

    for (let i = 0; i < thirdsubCategory.length; i++) {
      await CategoryModel.findByIdAndDelete(thirdsubCategory[i]._id);
    }

    for (let i = 0; i < subCategory.length; i++) {
      await CategoryModel.findByIdAndDelete(subCategory[i]._id);
    }

    const deleteCategory = await CategoryModel.findByIdAndDelete(request.params.id);

    if (!deleteCategory) {
      return response.status(404).json({
        message: "category not found",
        success: false,
        error: true,
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Category Deleted",
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true,
    });
  }
}

// ✅ Update Category Controller
export async function updateCategory(request, response) {
  let imagesArr = []; // ✅ define variable to fix ReferenceError

  const category = await CategoryModel.findByIdAndUpdate(
    request.params.id,
    {
      name: request.body.name,
      images: imagesArr.length > 0 ? imagesArr[0] : request.body.images,
      parentId: request.body.parentId,
      parentsCatName: request.body.parentsCatName
    },
    { new: true }
  );

  if (!category) {
    response.status(500).json({
      message: "Category cannot be updated",
      success: false,
      error: true
    });
  }

  imagesArr = [];

  response.status(200).json({
    error: false,
    success: true,
    category: category
  });
}
