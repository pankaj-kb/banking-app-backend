import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { registerCustomer, loginCustomer, logoutCustomer } from "../controllers/customer.controller.js";

const router = Router();

router.route('/register').post(registerCustomer)
router.route('/login').post(loginCustomer)
router.route('/logout').post(verifyJWT, logoutCustomer)

export default router;
