import { Router } from "express";
import auth from "../middleWere/auth.js";
import { addAdressController } from "../controllers/adresss.controller.js";

const adressRouter = Router();
adressRouter.post("/add-adress", auth, addAdressController);

export default adressRouter;
