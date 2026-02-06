import UserModel from "../Models/user.models.js";
import jwt from "jsonwebtoken";

const generatedRefreshToken = async(userId)=>{
    const token = await jwt.sign({id: userId},
        process.env.SECRET_KEY_REFRESH_TOKEN,
        {expiresIn: '30d'}
    );
    const updatedRefreshToken = await UserModel.updateOne(
        {
            _id : userId
        },
        {
            refresh_token : token
        }
    )
    return token;
}
export default generatedRefreshToken;