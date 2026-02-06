import { request, response } from "express";
import CartProductModel from "../Models/cartProduct.model.js";
import UserModel from '../Models/user.models.js';


export const addToCartItemController = async (request, response)=>{
    try {
        const userId = request.userId;
        const { productId } = request.body;

        if(!productId){
            return response.status(402).json({
                message:"provide ProductId",
                error: true,
                success: false
            })
        }
        const checkItemCart = await CartProductModel.findOne({
            userId: userId,
            productId: productId
        })

        if(checkItemCart){
            return response.status(400).json({
                message: "Item already Cart"
            })
        }

        const cartItem = new CartProductModel({
            quantity: 1,
            userId: userId,
            productId:productId
        })

        const save = await cartItem.save()

        const updateCartUser = await UserModel.updateOne({_id:userId},{
            $push :{
                shopping_cart : productId
            }
        })

        
        return response.status(200).json({
            data: save,
            message : "Item Add Successfully",
            error: false,
            success: true
        })
    } catch (error) {
         console.log(error);
         response.status(500).json({
         message: "Internal Server Error",
         success: false,
         error: true,
    }); 
    }
}


export const getCartItemController = async (request, response)=>{
    try {
        const userId = request.userId;
        const cartItem = await CartProductModel.find({
            userId: userId
        }).populate('productId')

        return response.status(200).json({
            data: cartItem,
            success: true,
            error: false
        })

    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message:error.message || error
        })   
    }
}


export const updateCartItemQtyController = async (request, response) =>{
    try {
        const userId = request.userId
        const {_id,qty} = request.body
        if(!_id || !qty){
            return response.status(400).json({
                message : "provide _id, qty"
            })
        }

        const updateCartitem = await CartProductModel.updateOne({
            _id: _id,
            userId: userId,
        },{
            quantity: qty
        }
    )

    return response.json({
        data: updateCartitem,
        error:false,
        success: true,
        message: "Updated cart"
    })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error: true,
            success: false
        })
    }
}


export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId; // ✅ middleware se aata hai
    const { _id, productId } = request.body;

    // ✅ Step 1: Check if required fields are provided
    if (!_id || !productId) {
      return response.status(400).json({
        message: "Please provide both _id and productId",
        error: true,
        success: false,
      });
    }

    // ✅ Step 2: Delete item from Cart collection
    const deleteCartItem = await CartProductModel.deleteOne({
      _id: _id,
      userId: userId,
    });

    if (deleteCartItem.deletedCount === 0) {
      return response.status(404).json({
        message: "Cart item not found or already deleted",
        error: true,
        success: false,
      });
    }

    // ✅ Step 3: Remove the product from user's shopping_cart
    const user = await UserModel.findById(userId);

    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // ✅ Step 4: Filter out the deleted productId from shopping_cart array
    user.shopping_cart = user.shopping_cart.filter(
      (id) => id.toString() !== productId.toString()
    );

    await user.save();

    // ✅ Step 5: Return response
    return response.status(200).json({
      message: "Item removed successfully from cart",
      success: true,
      error: false,
      data: deleteCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};
