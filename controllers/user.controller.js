// // controllers/authController.js

// import UserModel from '../Models/user.models.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import sendEmailFun from './sendEmail.js';
// import VerificationEmail from '../Utils/verifyEmailTemplate.js';
// import generatedAccessToken from '../Utils/generateAccessToken.js';
// import generatedRefreshToken from '../Utils/generatedRefreshToken.js';
// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';
// import { console } from 'inspector';

// cloudinary.config({
//     cloud_name: process.env.cloudinary_Config_Cloud_name,
//     api_key: process.env.cloudinary_Config_api_key,
//     api_secret: process.env.cloudinary_Config_api_secret,
//     secure: true
// });
// // --------------------- REGISTER USER ---------------------
// export async function registerUserController(req, res) {
//     try {
//         const { name, email, password } = req.body;

//         // Validate input
//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 message: 'Name, email, and password are required.',
//                 error: true,
//                 success: false
//             });
//         }

//         // Check if user already exists
//         let user = await UserModel.findOne({ email });
//         if (user) {
//             return res.status(400).json({
//                 message: 'User already exists.',
//                 error: true,
//                 success: false
//             });
//         }

//         // Generate OTP (6 digit code)
//         const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashPassword = await bcrypt.hash(password, salt);

//         // Create new user with OTP & Expiry
//         user = new UserModel({
//             name,
//             email,
//             password: hashPassword,
//             otp: verifyCode,
//             otpExpires: Date.now() + 10 * 60 * 1000 // OTP valid for 10 minutes
//         });

//         await user.save();

//         // Send email with OTP
//         await sendEmailFun({
//             sendTo: email,
//             subject: "Verify your email - Ecommerce App",
//             text: `Your verification code is ${verifyCode}`,
//             html: VerificationEmail(user, verifyCode)
//         });

//         // Generate JWT token
//         const token = jwt.sign(
//             { email: user.email, id: user._id },
//             process.env.JSON_WEB_SECRET_KEY,
//             { expiresIn: "7d" } // token expire time
//         );

//         return res.status(200).json({
//             success: true,
//             error: false,
//             message: "User registered successfully, please verify your email.",
//             token
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// }

// // --------------------- VERIFY EMAIL ---------------------
// export async function verifyEmailController(req, res) {
//     try {
//         const { email, code } = req.body;

//         // Check input
//         if (!email || !code) {
//             return res.status(400).json({
//                 message: "Email and verification code are required",
//                 error: true,
//                 success: false
//             });
//         }

//         // Find user
//         const user = await UserModel.findOne({ email });
//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found",
//                 error: true,
//                 success: false
//             });
//         }

//         // Validate OTP
//         const isCodeValid = user.otp === code; // 👈 FIXED (before it was otp undefined)
//         const isCodeExpired = user.otpExpires < Date.now();

//         if (isCodeValid && !isCodeExpired) {
//             user.verify_email = true;
//             user.otp = null;
//             user.otpExpires = null;
//             await user.save();

//             return res.status(200).json({
//                 success: true,
//                 message: "Email verified successfully",
//                 error: false
//             });
//         }

//         // Invalid or expired cases
//         if (!isCodeValid) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid verification code",
//                 error: true
//             });
//         }

//         if (isCodeExpired) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Verification code expired",
//                 error: true
//             });
//         }

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// }


// export async function loginUserController(request, response) {
//     const { email, password } = request.body;
//     const user = await UserModel.findOne({email:email});

//     if(!user) {
//         return response.status(400).json({
//             message: "User not found",
//             error: true,
//             success: false
//         })
//     }

//     if(user.status === "active"){
//         return response.status(400).json({
//             massege: "User is blocked, please contact admin",
//             error: true,
//             success: false
//         })
//     }
//     const checkPassword = await bcrypt.compare(password, user.password);
//     if(!checkPassword){
//         return response.status(400).json({
//             massege: "Invalid credentials",
//             error: true,
//             success: false
//         })
//     }

//     const accesstoken = await generatedAccessToken(user._id);
//     const refreshToken = await generatedRefreshToken(user._id);   


//     const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
//         last_login_date: Date.now(),
//     }
//     )
//     const cookiesOption = {
//         httpOnly: true,
//         secure: true,
//         sameSite: "none"
//     }

//     response.cookie('accessToken', accesstoken,cookiesOption);
//     response.cookie('refreshToken', refreshToken, cookiesOption);

//     return response.status(200).json({
//         massege: "User logged in successfully",
//         error: false,
//         success: true,
//         date : {
//             accesstoken,
//             refreshToken
//         }});
// }

// export async function logOutController(request, response) {
//     try {
//         const userId = request.userId;

//         const cookiesOption = {
//             httpOnly: true,
//             secure: true,
//             sameSite: "none"
//         };

//         // Clear cookies
//         response.clearCookie("accessToken", cookiesOption);
//         response.clearCookie("refreshToken", cookiesOption);

//         // Remove refresh token from DB
//         await UserModel.findByIdAndUpdate(userId, {
//             refresh_token: ""
//         });

//         return response.json({
//             message: "Logout successfully",
//             error: false,
//             success: true
//         });
//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// }


// var imagesArr = []; // to store image info temporarily
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";

// export async function userAvatarController(request, response) {
//   try {
//     let imagesArr = []; // Clear previous images
//     const userId = request.userId;
//     const images = request.files; // ✅ multiple files handle

//     const options = {
//       use_filename: true,
//       unique_filename: false,
//       overwrite: false,
//     };

//     for (let i = 0; i < images.length; i++) {
//       const result = await cloudinary.uploader.upload(images[i].path, options);
//       imagesArr.push(result.secure_url);

//       // delete file from local uploads folder after uploading
//       fs.unlinkSync(images[i].path);
//     }

//     return response.status(200).json({
//       _id: userId,
//       avatar: imagesArr[0], // agar ek hi avatar rakhna hai
//       images: imagesArr, // optional: return all uploaded
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// controllers/authController.js

import UserModel from '../Models/user.models.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmailFun from './sendEmail.js';
import VerificationEmail from '../Utils/verifyEmailTemplate.js';
import generatedAccessToken from '../Utils/generateAccessToken.js';
import generatedRefreshToken from '../Utils/generatedRefreshToken.js';
import { v2 as cloudinary } from 'cloudinary';
import upload from '../middleWere/multer.js';
import fs from 'fs';
import { error } from 'console';
import { verify } from 'crypto';
import { console } from 'inspector';

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true
});

// --------------------- REGISTER USER ---------------------
export async function registerUserController(req, res) {
  try {
    const { name, phoneNo, email, password } = req.body;
    console.log("Register Payload:", req.body); // Debug log

    if (!name || !phoneNo || !email || !password) {
      console.log("Register Validation Failed: Missing fields"); // Debug log
      return res.status(400).json({ message: 'Name, email, and password are required.', error: true, success: false });
    }

    let user = await UserModel.findOne({ email });
    if (user) {
      console.log("Register Validation Failed: User already exists"); // Debug log
      return res.status(400).json({ message: 'User already exists.', error: true, success: false });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    user = new UserModel({
      name,
      phoneNo,
      email,
      password: hashPassword,
      otp: verifyCode,
      otpExpires: Date.now() + 10 * 60 * 1000
    });

    await user.save();

    await sendEmailFun({
      to: email,
      subject: "Verify your email - Ecommerce App",
      text: `Your verification code is ${verifyCode}`,
      html: VerificationEmail(user.name, verifyCode)
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully, please verify your email.",
      error: false
    });

  } catch (error) {
    return res.status(500).json({ message: error.message || error, error: true, success: false });
  }
}

// --------------------- VERIFY EMAIL ---------------------
export async function verifyEmailController(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: "Email and verification code are required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const isCodeValid = user.otp === code;
    const isCodeExpired = user.otpExpires < Date.now();

    if (!isCodeValid) {
      return res.status(400).json({
        message: "Invalid verification code",
        error: true,
        success: false,
      });
    }

    if (isCodeExpired) {
      return res.status(400).json({
        message: "Verification code expired",
        error: true,
        success: false,
      });
    }

    // ✅ Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully!",
      success: true,
      error: false,
    });

  } catch (error) {
    console.error("Error in verifyEmailController:", error);
    return res.status(500).json({
      message: error.message || "Server error",
      error: true,
      success: false,
    });
  }
}



// --------------------- LOGIN ---------------------
export async function loginUserController(req, res) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found", error: true, success: false });
  }

  if (user.status === "blocked") {
    return res.status(400).json({ message: "User is blocked, please contact admin", error: true, success: false });
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    return res.status(400).json({ message: "Invalid credentials", error: true, success: false });
  }

  const accesstoken = await generatedAccessToken(user._id);
  const refreshToken = await generatedRefreshToken(user._id);

  await UserModel.findByIdAndUpdate(user._id, { last_login_date: Date.now() });

  const cookiesOption = { httpOnly: true, secure: true, sameSite: "none" };
  res.cookie('accessToken', accesstoken, cookiesOption);
  res.cookie('refreshToken', refreshToken, cookiesOption);

  return res.status(200).json({
    message: "User logged in successfully",
    error: false,
    success: true,
    data: {
      accesstoken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        avatar: user.avatar,
        role: user.role
      }
    }
  });
}

// --------------------- LOGOUT ---------------------
export async function logOutController(req, res) {
  try {
    const userId = req.userId;
    const cookiesOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // localhost par false
      sameSite: "none",
    };

    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    await UserModel.findByIdAndUpdate(userId, { refresh_token: "" });

    return res.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// ----------------- UPLOAD AVATAR -----------------
// export async function userAvatarController(req, res) {
//   try {
//     const userId = req.userId;
//     const file = req.files; // ✅ single file use kar rahe hain

//     if (!file) {
//       return res.status(400).json({
//         message: "No file uploaded",
//         error: true,
//         success: false,
//       });
//     }

//     const result = await cloudinary.uploader.upload(file.path, {
//       use_filename: true,
//       unique_filename: false,
//       overwrite: false,
//     });

//     fs.unlinkSync(file.path); // local file delete kar di

//     return res.status(200).json({
//       _id: userId,
//       avatar: result.secure_url,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// export async function userAvatarController(req, res) {
//   try {
//     const userId = req.userId;
//     const files = req.files; // ✅ multiple files

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         message: "No files uploaded",
//         error: true,
//         success: false,
//       });
//     }

//     // ہر فائل کو Cloudinary پر اپلوڈ کرو
//     const uploadResults = await Promise.all(
//       files.map(async (file) => {
//         const result = await cloudinary.uploader.upload(file.path, {
//           use_filename: true,
//           unique_filename: false,
//           overwrite: false,
//         });

//         // لوکل سے فائل ڈیلیٹ کر دو
//         fs.unlinkSync(file.path);

//         return result.secure_url; // Cloudinary URL واپس دو
//       })
//     );

//     // MongoDB میں user کو update کرو
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userId,
//       { avatar: uploadResults }, // array of URLs
//       { new: true }
//     );

//     return res.status(200).json({
//       message: "Files uploaded successfully",
//       success: true,
//       user: updatedUser,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

var imagessArr = [];
// ----------------- UPLOAD AVATAR -----------------
// export async function userAvatarController(req, res) {
//   try {
//     let imagesArr = []; // ✅ locally define array

//     const userId = req.userId;
//     const files = req.files; // ✅ multiple files

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         message: "No files uploaded",
//         error: true,
//         success: false,
//       });
//     }

//     const options = {
//       use_filename: true,
//       unique_filename: false,
//       overwrite: false,
//     };

//     // ✅ sab files Cloudinary par upload kar ke array me push
//     for (let i = 0; i < files.length; i++) {
//       const result = await cloudinary.uploader.upload(files[i].path, options);
//       imagesArr.push(result.secure_url);

//       // local file delete
//       fs.unlinkSync(files[i].path);
//     }
//     user.avatar = imagesArr[0]; // agar ek hi avatar rakhna hai
//     await user.saved();

//     // ✅ MongoDB user update
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userId,
//       { avatar: imagesArr }, // array of URLs save
//       { new: true }
//     );

//     return res.status(200).json({
//       message: "Files uploaded successfully",
//       success: true,
//       user: updatedUser,
//       avatar: imagesArr[0],
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }


// export async function userAvatarController(request, response) {
//   try {
//     let imagesArr = [];

//     const userId = request.userId;
//     const image = request.files;

//     const options = {
//       use_filename: true,
//       unique_filename: false,
//       overwrite: false,   // ✅ spelling fix
//     };

//     for (let i = 0; i < image.length; i++) {
//       const img1 = await cloudinary.uploader.upload(
//         image[i].path,
//         options,
//         function (error, result) {
//           if (error) {
//             return response.status(500).json({ message: error.message });
//           }

//           imagesArr.push(result.secure_url);

//           // ✅ space hata diya & correct property use
//           fs.unlinkSync(`uploads/${request.files[i].filename}`);

//           return response.status(200).json({
//             _id: userId,
//             avtar: imagesArr[0],
//           });
//         }
//       );


//     }
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

export async function userAvatarController(request, response) {
  try {
    imagessArr = [];
    const userId = request.userId;
    const image = request.files;

    const user = await UserModel.findOne({ _id: userId });

    // ✅ Check user first before using user.avatar
    if (!user) {
      return response.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    const imgUrl = user.avatar;

    // ✅ Ensure imgUrl exists and is a string
    if (imgUrl && typeof imgUrl === "string") {
      const urlArr = imgUrl.split("/");
      const avatar_image = urlArr[urlArr.length - 1];
      const imageName = avatar_image.split(".")[0];

      if (imageName) {
        await cloudinary.uploader.destroy(
          imageName,
          (error, result) => {
            // console.log("Deleted image from cloudinary", result, error);
          }
        );
      }
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < image?.length; i++) {
      const img = await cloudinary.uploader.upload(
        image[i].path,
        options,
        function (error, result) {
          imagessArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${request.files[i].filename}`);
        }
      );
    }

    user.avatar = imagessArr[0];
    await user.save();

    return response.status(200).json({
      _id: userId,
      avatar: imagessArr[0],
    });
  } catch (error) {
    return response.status(500).json({
      message: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
}

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


//update user detail
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId; // from auth middleware
    const { name, email, mobile, phoneNo, password } = request.body;

    // ✅ 1. Check if user exists
    const userExiest = await UserModel.findById(userId);
    if (!userExiest) {
      return response.status(400).json({
        message: "User not found — cannot update",
        error: true,
        success: false,
      });
    }

    // ✅ 2. Check if email changed
    let verifyCode = "";
    let verify_email = userExiest.verify_email; // default: keep old value

    if (email && email !== userExiest.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      verify_email = false; // new email must be verified again
    }

    // ✅ 3. Hash password if changed
    let hashPassword = userExiest.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashPassword = await bcrypt.hash(password, salt);
    }

    // ✅ 4. Update user data
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name,
        mobile: mobile || userExiest.mobile,
        phoneNo: phoneNo || mobile || userExiest.phoneNo,
        email,
        verify_email,
        password: hashPassword,
        otp: verifyCode || null,
        otpExpires: verifyCode ? Date.now() + 10 * 60 * 1000 : null, // 10 mins
      },
      { new: true }
    );

    // ✅ 5. Send verification email if email changed
    if (verifyCode) {
      await sendEmailFun({
        to: email,
        subject: "Verify your email - Ecommerce App",
        text: `Your verification code is ${verifyCode}`,
        html: VerificationEmail(name || userExiest.name, verifyCode),
      });
    }

    // ✅ 6. Send response
    return response.status(200).json({
      message:
        verifyCode !== ""
          ? "User updated successfully. Verification email sent."
          : "User updated successfully.",
      error: false,
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}


//forgot password
export async function forgotPasswordController(request, response) {
  try {
    const { email } = request.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = verifyCode;
    user.otpExpires = Date.now() + 600000; // 10 mins
    await user.save();

    await sendEmailFun({
      to: email,
      subject: "Verify your email - Ecommerce App",
      text: `Hello ${user.name}, your verification code is ${verifyCode}`,
      html: VerificationEmail(user.name, verifyCode),
    });

    return response.json({
      message: "Check your email for the verification code",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || "Something went wrong",
      error: true,
      success: false,
    });
  }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body;
    const user = await UserModel.findOne({
      email: email
    })
    if (!user) {
      return response.status(400).json({
        message: "email not availiable",
        error: true,
        success: false,
      })
    }
    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide required field email and otp ",
        error: true,
        success: false,
      })
    }
    if (otp !== user.otp) {
      return response.status(400).json({
        message: "invalid otp",
        error: true,
        success: false,
      })
    }
    const currentTime = new Date().toISOString();
    if (user.otpExpires < currentTime) {
      return response.status(400).json({
        message: "otp expired",
        error: true,
        success: false,
      })
    }
    // user.otp = "";  <-- COMMENTED OUT: Keep OTP for reset step
    // user.otpExpires = "";
    // await user.save();
    return response.status(200).json({
      message: "OTP verified successfully",
      error: false,
      success: true,
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
}

//reset password 
export async function resetpassword(request, response) {
  try {
    const { email, oldPassword, newPassword, confirmPassword, otp } = request.body; // Added otp

    if (!email || !newPassword || !confirmPassword) { // Removed oldPassword from strict check
      return response.status(400).json({
        message: "Provide required field email, newPassword and confirmPassword",
        error: true,
        success: false,
      })
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return response.status(400).json({
        message: "email not availiable",
        error: true,
        success: false,
      })
    }

    // Logic to handle either Old Password OR OTP
    let isAuthorized = false;

    if (oldPassword) {
      const checkPassword = await bcrypt.compare(oldPassword, user.password);
      if (!checkPassword) {
        return response.status(400).json({
          message: "old password is incorrect",
          error: true,
          success: false,
        })
      }
      isAuthorized = true;
    } else if (otp) {
      // Check OTP manually if oldPassword is not provided
      if (otp !== user.otp) {
        return response.status(400).json({
          message: "Invalid OTP",
          error: true,
          success: false,
        })
      }
      const currentTime = new Date().toISOString();
      if (user.otpExpires < currentTime) {
        return response.status(400).json({
          message: "OTP expired",
          error: true,
          success: false,
        })
      }
      isAuthorized = true;
      // Clear OTP after use
      user.otp = "";
      user.otpExpires = "";
    } else {
      return response.status(400).json({
        message: "Provide oldPassword or validated OTP",
        error: true,
        success: false,
      })
    }


    if (newPassword !== confirmPassword) {
      return response.status(400).json({
        message: "password and confirmPassword dose not match",
        error: true,
        success: false,
      })
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(confirmPassword, salt);

    user.password = hashPassword;
    await user.save();

    return response.json({
      message: "Password reset successfully",
      error: false,
      success: true,
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
}

// refresh Token controller
export async function refreshToken(request, response) {
  try {
    const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1];
    if (!refreshToken) {
      return response.status(401).json({
        message: "Refresh token not provided",
        error: true,
        success: false,
      });
    }
    const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
    if (!verifyToken) {
      return response.status(401).json({
        message: "tocken is expired, please login again",
        error: true,
        success: false,
      })
    }
    const userId = verifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId);

    const coolieOption = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    }
    response.cookies('accessToken', newAccessToken, coolieOption);

    return response.json({
      message: "NEw Access token generated successfully",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      }
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
}

// get login user detail
export async function userDetails(request, response) {
  try {
    const userId = request.userId
    console.log("userId from auth middleware", userId);

    const user = await UserModel.findById(userId).select("-password -otp -otpExpires -__v");

    return response.json({
      message: "User details fetched successfully",
      data: user,
      error: false,
      success: true,
    })
  }
  catch (error) {
    return response.status(500).json({
      message: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
}