import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads"); // agar folder na ho to create kar do
    }
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
export default upload;
// userAvatarController.js
// import UserModel from "../Models/user.models.js";

// export const userAvatarController = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const filePath = req.files[0].path; // "uploads/1694159455-avatar.png"

//     // update user document
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       req.userId,
//       { avatar: filePath },
//       { new: true }
//     );

//     res.json({
//       message: "Avatar uploaded successfully",
//       success: true,
//       user: updatedUser,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message, error: true });
//   }
// };
