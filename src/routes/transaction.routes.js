import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { sendAmount, depositAmount, withdrawAmount } from "../controllers/transaction.controller.js";

const router = Router();

router.use(verifyJWT)

router.route('/sendamount').post(sendAmount)
router.route('/deposit').post(depositAmount)
router.route('/withdraw').post(withdrawAmount)

export default router