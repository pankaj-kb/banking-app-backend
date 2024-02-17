import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { sendAmount, depositAmount, withdrawAmount, getTransactionInfo } from "../controllers/transaction.controller.js";

const router = Router();

router.use(verifyJWT)

router.route('/sendamount').post(sendAmount)
router.route('/deposit').post(depositAmount)
router.route('/withdraw').post(withdrawAmount)
router.route('/:transactionId').get(getTransactionInfo)

export default router