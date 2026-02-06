import { Router } from "express";
import auth from "../middleWere/auth.js";
import upload from "../middleWere/multer.js";
import { 
    uploadedImages,
    createProduct, 
    getAllProducts, 
    getAllProductsByCatId, 
    getAllProductsByCatName, 
    getAllProductsBySubCatId,
    getAllProductsBySubCatName,
    getAllProductsByThirdLevelCatId,
    getAllProductsByThirdLevelCatName,
    getAllProductByPrice,
    getAllProductsByRating,
    getProductCount,
    getAllFeaturedProucts,
    // deleteProducts,
    getProuct,
    removeImageFromCloudinary,
    updateProduct
    } from "../controllers/product.controller.js";
const productRouter = Router();
productRouter.post('/uploadImages', auth, upload.array('images'), uploadedImages); 
productRouter.post('/create', auth, createProduct); 
productRouter.get('/getAllProduct',getAllProducts); 
productRouter.get('/getAllProductCatID/:id',getAllProductsByCatId); 
productRouter.get('/getAllProductCatName',getAllProductsByCatName); 
productRouter.get('/getAllProductSubCatID/:id',getAllProductsBySubCatId); 
productRouter.get('/getAllProductSubCatName',getAllProductsBySubCatName); 
productRouter.get('/getAllProductThirdLevelCatID/:id',getAllProductsByThirdLevelCatId); 
productRouter.get('/getAllProductThirdLevelCatName',getAllProductsByThirdLevelCatName); 
productRouter.get('/getAllProductByPrice',getAllProductByPrice); 
productRouter.get('/getAllProductByRating',getAllProductsByRating); 
productRouter.get('/getAllProductCount',getProductCount); 
productRouter.get('/getAllfuthureProduct',getAllFeaturedProucts); 
// productRouter.delete('/:id',deleteProducts); 
productRouter.delete('/getProducts',getProuct); 
productRouter.delete('/removeImg', auth, removeImageFromCloudinary);
productRouter.put('/updateProduct/:id', auth, updateProduct); 


export default productRouter;



