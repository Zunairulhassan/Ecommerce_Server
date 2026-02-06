import { Router } from "express";
import auth from "../middleWere/auth.js";
import { loginUserController, logOutController,userDetails, updateUserDetails,resetpassword, verifyForgotPasswordOtp,forgotPasswordController, registerUserController, userAvatarController,removeImageFromCloudinary, verifyEmailController } from '../controllers/user.controller.js';
import upload from "../middleWere/multer.js";
const userRouter = Router()
userRouter.post('/register', registerUserController);
userRouter.post('/verify-email', verifyEmailController); // kebab-case
userRouter.post('/login', loginUserController);
userRouter.get('/logout', auth, logOutController); // POST instead of GET
userRouter.put('/user-avatar',auth,upload.array('avatar'),userAvatarController); // POST instead of GET
// userRouter.put(
//   '/user-avatar',
//   auth,
//   upload.array('avatar'),
//   userAvatarController
// );

userRouter.delete('/removeImg', auth, removeImageFromCloudinary);
userRouter.put('/:id', auth, updateUserDetails);
userRouter.get("/user-details", auth, userDetails);
userRouter.post('/forgot-password', forgotPasswordController);
userRouter.post('/verify-forgot-password-otp', verifyForgotPasswordOtp);
userRouter.post('/reset-password', resetpassword);


export default userRouter;