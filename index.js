import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import connectDB from "./Config/connectDB.js";
import userRouter from "./router/user.route.js";
import categoryRoute from "./router/category.route.js";
import productRouter from "./router/product.router.js";
import cartRouter from "./router/cart.route.js";
import myListRouter from "./router/myList.router.js";
import adressRouter from "./router/adress.route.js";

dotenv.config();

const app = express();

/* =======================
   CORS CONFIG (IMPORTANT)
======================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ecommerce-admin-flax-eta.vercel.app",
      "https://ecommerce-admin-ig20vfa9n-zunair-ul-hassans-projects.vercel.app",
    ],
    credentials: true,
  })
);

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

/* =======================
   TEST ROUTE
======================= */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running 🚀",
  });
});

/* =======================
   ROUTES
======================= */
app.use("/api/user", userRouter);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/myList", myListRouter);
app.use("/api/adress", adressRouter);

/* =======================
   DATABASE CONNECT
======================= */
connectDB();

/* =======================
   ❌ NO app.listen() ❌
   ✅ EXPORT FOR VERCEL
======================= */
export default app;
