import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    registerBanker,
    loginBanker,
    logoutBanker,
    getAllCustomers,
    getCustomerInfo
} from "../controllers/banker.controller.js";

const router = Router();

router.route('/register').post(registerBanker)
router.route('/login').post(loginBanker)
router.route('/logout').post(verifyJWT, logoutBanker)
router.route('/customers').get(verifyJWT, getAllCustomers)
router.route('/customer/:customerusername').get(verifyJWT, getCustomerInfo)

export default router;
