import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.ObjectId,
        ref : 'User'
    },
    orderId: {
        type: String,
        required : [true,"Provide orderId"],
        unique: true
    },
    productId : {
        type: mongoose.Schema.ObjectId,
        ref: "product"
    },
    product_detail : {
        name: String,
        image :Array
    },
    payment_status : {
        type: String,
        default : ""
    },
    delievery_address : {
        type: mongoose.Schema.ObjectId,
        ref : 'address'
    },
    subTotalAmt : {
        type: Number,
        default: 0
    },
    totalAmt : {
        type: Number,
        default: 0
    }
},
{
    timestamps : true
}) 

const orderModel = mongoose.model("Order", orderSchema);
export default orderModel;