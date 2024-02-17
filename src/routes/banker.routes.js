import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    registerBanker,
    loginBanker,
    logoutBanker
} from "../controllers/banker.controller.js";

const router = Router();

router.route('/register').post(registerBanker)
router.route('/login').post(loginBanker)
router.route('/logout').post(verifyJWT, logoutBanker)

export default router;
