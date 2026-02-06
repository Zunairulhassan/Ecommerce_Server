import AdresssModel from "../Models/adress.model.js";
import UserModel from "../Models/user.models.js";

export const addAdressController = async (request, response) => {
    try {
        const { address_line, city, state, pincode, country, mobile, status } = request.body;
        const userId = request.userId;
        if (!address_line || !city || !state || !pincode || !country || !mobile || !status) {
            return response.status(400).json({ message: "All fields are required", error: true, success: false });
        }

        const adress = new AdresssModel({
            address_line,
            city,
            state,
            pincode,
            country,
            mobile,
            status,
            userId
        })
        const saveAdress = await adress.save();
        const updatedcartUser = await UserModel.updateOne({ _id: userId }, {
            $push: {
                address_defaults: saveAdress?._id
            }
        })
        return response.status(200).json({ data: saveAdress, message: "Address added successfully", error: false, success: true });
    } catch (error) {
        return response.status(500).json({ message: "Internal server error", error: true, success: false });
    }
}
