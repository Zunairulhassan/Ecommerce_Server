import { request, response } from 'express';
import myListModel from '../Models/myList.model.js';

export const addToMyListController = async (request, response) =>{
    try {
        const userId = request.userId;
        const {
            productId,
            productTittle,
            image,
            rating,
            price,
            oldPrice,
            brand,
            discount
        } = request.body;

        const item = await myListModel.findOne({
            userId:userId,
            productId: productId
        })

        if(item){
            return response.status(400).json({
                message: "order already in my list"
            })
        }

        const myList = new myListModel({
            productId,
            productTittle,
            image,
            rating,
            price,
            oldPrice,
            brand,
            discount,
            userId
        })

        const save = await myList.save();

        return response.status(200).json({
            error:false,
            success: true,
            message:"the product save in my list",
            data: save
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export const deleteToMyListController = async(request, response) =>{
    try {
        const myListItem = await myListModel.findById(request.params.id);
        if(!myListItem){
            return response.status(404).json({
                message: "the item with the given id is not found",
                error: true,
                 success: false
            })
        }
        const deletedItem = await myListModel.findByIdAndDelete(request.params.id);

        if(!deletedItem){
            return response.status(404).json({
                message:"item is not deleted",
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error:false,
            success:true,
            message:"the item removed"
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const getMyListController = async (request, response)=>{
    try {
        const userId = request.userId;
        const myListItem = await myListModel.find({
            userId: userId
        })

        return response.status(200).json({
            error:false,
            success: true,
            data: myListItem
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}