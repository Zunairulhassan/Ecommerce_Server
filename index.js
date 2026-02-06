import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './Config/connectDB.js';
import userRouter from './router/user.route.js';
import categoryRoute from './router/category.route.js';
import productRouter from './router/product.router.js';
import cartRouter from './router/cart.route.js';
import myListRouter from './router/myList.router.js';
import adressRouter from './router/adress.route.js';
const app = express();
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(helmet({
    crossOriginEmbedderPolicy: false
}))


app.get("", (request, response) => {
    response.json({
        massage: "Server is running" + process.env.PORT
    })
})

app.use('/api/user', userRouter);
app.use('/api/category', categoryRoute);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/myList', myListRouter);
app.use('/api/adress', adressRouter);

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server is running", process.env.PORT)
    })
})