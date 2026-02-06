import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.split(" ")[1];
    // if (!token) {
    //   token = req.query?.token;
    // }
    if (!token) {
      return res.status(401).json({
        message: "Provide Token",
        error: true,
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    if (!decode) {
      return res.status(401).json({
        message: "Invalid Token",
        error: true,
        success: false,
      });
    }

    req.userId = decode.id; // user ki id request ke sath attach kar di
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Session expired or invalid token, please login again",
        error: true,
        success: false,
      });
    }
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export default auth;
