import mongoose from 'mongoose';

const cartProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ 'typee' → 'type'
      ref: "Product", // ✅ Model name string me, aur correct capitalization
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ reference to User model
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const CartProductModel = mongoose.model("CartProduct", cartProductSchema);
export default CartProductModel;
