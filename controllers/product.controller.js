import ProductModel from "../Models/product.model.js";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});
var imagesArray = [];
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

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      folder: "categories", // optional: store inside "categories/" folder in Cloudinary
    };

    // ✅ Upload images to Cloudinary
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i].path, options);
      uploadedImages.push(result.secure_url);

      // ✅ Remove temp file after upload
      if (fs.existsSync(images[i].path)) {
        fs.unlinkSync(images[i].path);
      }
    }

    // ✅ Return uploaded image URLs
    return response.status(201).json({
      message: "Images uploaded successfully!",
      success: true,
      images: uploadedImages,
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong while uploading images",
      error: error.message,
      success: false,
    });
  }
}

//crewate product
export async function createProduct(request, response) {
  try {
    // ⚠️ Make sure imagesArr is defined before using it!
    const imagesArr = request.body.images || [];

    const product = new ProductModel({
      name: request.body.name,
      description: request.body.description,
      images: imagesArr,
      brand: request.body.brand,
      price: request.body.price,
      oldPrice: request.body.oldPrice,
      catName: request.body.catName,
      catId: request.body.catId, // ✅ fixed spelling (was carId)
      subCatId: request.body.subCatId,
      subCat: request.body.subCat,
      thirdsubCat: request.body.thirdsubCat,
      thirdsubCatId: request.body.thirdsubCatId,
      countInStock: request.body.countInStock,
      rating: request.body.rating, // ✅ fixed spelling (was reating)
      isFeatured: request.body.isFeatured,
      discount: request.body.discount,
      productRam: request.body.productRam,
      size: request.body.size,
      productWeight: request.body.productWeight,
    });

    // ✅ Correct way to save
    const savedProduct = await product.save();

    if (!savedProduct) {
      return response.status(500).json({
        error: true,
        success: false,
        message: "Product not created",
      });
    }

    return response.status(200).json({
      message: "Product created successfully",
      error: false,
      success: true,
      product: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return response.status(500).json({
      message: error.message || "The product is not created",
      error: true,
      success: false,
    });
  }
}


// get all products
export async function getAllProducts(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage);

    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if(page> totalPages){
      return response.status(404).jaon({
        message:"Page not Found",
        error: true,
        success: false
      })
    }
    // ✅ Wait for MongoDB to return data
    const products = await ProductModel.find().populate("category").skip((page-1) * perPage).limit(perPage).exec();

    if (!products || products.length === 0) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products: products,
      totalPages:totalPages,
      page:page
    });

  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// ✅ Get product by Category ID
export async function getAllProductsByCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not Found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      catId: request.params.id,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// ✅ Get product by Category Name
export async function getAllProductsByCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not Found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      catName: request.params.catName,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// ✅ Get product by Sub Category ID
export async function getAllProductsBySubCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not Found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      subCatId: request.params.id,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// ✅ Get product by Sub Category Name
export async function getAllProductsBySubCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not Found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      subCat: request.params.subCat,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// ✅ Get product by Third Level Category ID
export async function getAllProductsByThirdLevelCatId(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not Found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      thirdsubCatId: request.params.id,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// ✅ Get product by Third Level Category Name
export async function getAllProductsByThirdLevelCatName(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not Found",
        error: true,
        success: false,
      });
    }

    const products = await ProductModel.find({
      thirdsubCat: request.params.thirdsubCat,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// ✅ Get products by Price Range
export async function getAllProductByPrice(request, response) {
  try {
    let productList = [];

    if (request.query.catId) {
      productList = await ProductModel.find({
        catId: request.query.catId,
      }).populate("category");
    }

    if (request.query.subCatId) {
      productList = await ProductModel.find({
        subCatId: request.query.subCatId,
      }).populate("category");
    }

    if (request.query.thirdsubCatId) {
      productList = await ProductModel.find({
        thirdsubCatId: request.query.thirdsubCatId,
      }).populate("category");
    }

    const filteredProducts = productList.filter((product) => {
      if (request.query.minPrice && product.price < parseInt(request.query.minPrice)) {
        return false;
      }
      if (request.query.maxPrice && product.price > parseInt(request.query.maxPrice)) {
        return false;
      }
      return true;
    });

    return response.status(200).json({
      products: filteredProducts,
      totalPages: 0,
      page: 0,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Get Products by Price Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products by price",
      error: true,
      success: false,
    });
  }
}


export async function getAllProductsByRating(request, response) {
  try {
    const page = parseInt(request.query.page) || 1;
    const perPage = parseInt(request.query.perPage) || 10000;
    const totalPosts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return response.status(404).json({
        message: "Page not Found",
        error: true,
        success: false,
      });
    }

    // ✅ Use query instead of params/body
    const rating = parseFloat(request.query.rating);
    const catId = request.query.catId;

    const products = await ProductModel.find({
      rating: rating,
      catId: catId,
      // subCatId: request.query.subCatId,
      // thirdsubCatId: request.query.thirdsubCatId,
    })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

// get counted producte
export async function getProductCount(request, response){
  try {
    const productsCount = await ProductModel.countDocuments();

    if(!productsCount){
      response.status(500).json({
        error:true,
        success: false
      })
    }

    return response.status(200).json({
      error:false,
      success: true,
      productsCount: productsCount
    })
  } catch (error) {
   console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

//is featured of products
export async function getAllFeaturedProucts(request, response) {
  try {

    const products = await ProductModel.find({
      isFeatured: true
    })
      .populate("category");
    if (!products.length) {
      return response.status(404).json({
        message: "No products found",
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Products fetched successfully",
      error: false,
      success: true,
      product:products
    });
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}


//delete product
// export async function deleteProducts(request, response){
//   const product = await ProductModel.findById(request.params.id).populate("category");

//   if(!product){
//     return response.status(404).json({
//       message:"Product Not Found",
//       error: true,
//       success: false
//     })
//   }

//   const images = product.images;
//   let img = "";
//   for(img of images){
//     const imgUrl = img;
//     const urlArr = imgUrl.split("/");
//     const image = urlArr[urlArr.length-1];
//     const imageName =  image.split(".")[0];
//     if(imageName){
//       cloudinary.uploader.destroy(imageName, (error, result) =>{
//         // console.log(error, result);
//       })
//     }
    
//   }

//   const deleteProducts = await ProductModel.findByIdAndDelete(request.params.id);

//   if(!deleteProducts){
//     response.status(404).json({
//       message:"Products not deleted",
//       success: false,
//       error:true
//     })
//   }

//   return response.status(200).json({
//     success: true,
//     error: false,
//     message:"Product Deleted"
//   })
// }



export async function getProuct (request, response){
  try {
    const product = await ProductModel.findById(request.params.id).populate("category");

    if(!product){
      return response.status(404).json({
        message:"the Product is not found",
        error: true,
        success: false
      })
    }

    return response.status(200).json({
      error:false,
      success:true,
      product:product
    })
  } catch (error) {
    console.error("Get All Products Error:", error);
    return response.status(500).json({
      message: error.message || "Failed to fetch products",
      error: true,
      success: false,
    });
  }
}

//delete image
export async function removeImageFromCloudinary(request, response) {  // ✅ spelling fix
  const imgUrl = request.query.img1;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  if (imageName) {
    try {
      const res = await cloudinary.uploader.destroy(imageName); // ✅ await + no callback

      if (res) {
        response.status(200).json(res);
      }
    } catch (error) {
      return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });
    }
  }
}


//update product
export async function updateProduct(request, response){
  try {
    const product = await ProductModel.findByIdAndUpdate(
      request.params.id,
      {
        name: request.body.name,
        subCat: request.body.subCat,
        description: request.body.description,
        images: request.body.images,
        brand: request.body.brand,
        price: request.body.price,
        oldPrice: request.body.oldPrice,
        catId: request.body.catId,
        catName:request.body.catName,
        subCat: request.body.subCat,
        subCatId: request.body.subCatId,
        thirdsubCat: request.body.thirdsubCat,
        thirdsubCatId:request.body.thirdsubCatId,
        category:request.body.category,
        countInStock:request.body.countInStock,
        rating: request.body.rating,
        isFeatured: request.body.isFeatured,
        discount: request.body.discount,
        productRam: request.body.productRam,
        size: request.body.size,
        ProductWeight:request.body.ProductWeight,
      },
      {new:true}
    )

    if(!product){
      return response.status(404).json({
        message:"the product can not be updated",
        success:false,
         error: true
      })
    }

    imagesArr = [];
    return response.status(200).json({
      message:"the product has been updated",
      error: false,
      success: true
    })
  } catch (error) {
    return response.status(500).json({
        message: error.message || error,
        error: true,
        success: false,
      });
  }
}