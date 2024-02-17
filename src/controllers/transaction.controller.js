import { asyncHandler } from "../utils/asyncHandler.js"
import { APIResponse } from "../utils/APIResponse.js"
import { APIError } from "../utils/APIError.js"
import { Customer } from "../models/customer.model.js";
import { Transaction } from "../models/transaction.model.js";
import mongoose from "mongoose";

const sendAmount = asyncHandler(async (req, res) => {
    const { amount, to, pin } = req.body;

    console.log(req.body)

    const requiredFields = [amount, to, pin];

    if (requiredFields.some((field) => field === undefined || field.trim() === "")) {
        console.log("Fields:", requiredFields);
        throw new APIError(400, "All fields are required");
    }

    const user = await Customer.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(400, "Unauthorized request")
    }

    console.log(`User Balance: ${user.balance}`)

    const reciever = await Customer.findOne({ username: to })

    if (!reciever) {
        throw new APIError(404, "Reciever does to exist.")
    }

    if (pin !== user.pin) {

        const transaction = await Transaction.create({
            transactionType: "debit",
            amount,
            from: user._id,
            to: reciever._id,
            status: "Failed",
        })
        await Customer.findByIdAndUpdate(
            user._id,
            {
                $push: { transactions: transaction._id },
            },
            {
                new: true,
            }
        );
        throw new APIError(404, "Wrong Pin !!")
    }

    if (user?.balance < amount) {
        const transaction = await Transaction.create({
            transactionType: "debit",
            amount,
            from: user._id,
            to: reciever._id,
            status: "Failed",
        })
        await Customer.findByIdAndUpdate(
            user._id,
            {
                $push: { transactions: transaction._id },
            },
            {
                new: true,
            }
        );
        throw new APIError(404, "Not Enough Balance")
    }

    const senderTransaction = await Transaction.create({
        transactionType: "debit",
        amount,
        from: req.user._id,
        to: reciever._id,
        status: "Success",
    })

    const recieverTransaction = await Transaction.create({
        transactionType: "credit",
        amount,
        from: req.user._id,
        to: reciever._id,
        status: "Success",
    })


    if (!(senderTransaction || recieverTransaction)) {
        throw new APIError(500, "Something went wrong while saving transaction")
    }

    const updateSender = await Customer.findByIdAndUpdate(user._id, {
        $inc: { balance: -parseFloat(amount) },
        $push: { transactions: senderTransaction._id },
    }, {
        new: true
    })

    const updateReciever = await Customer.findByIdAndUpdate(reciever._id, {
        $inc: { balance: parseFloat(amount) },
        $push: { transactions: recieverTransaction._id },

    }, {
        new: true
    })

    if (!(updateSender || updateReciever)) {
        throw new APIError(500, "Something went wrong while updating/saving balance.")
    }

    return res
        .status(201)
        .json(new APIResponse(201, senderTransaction, "Amount has been sent"))
})

const depositAmount = asyncHandler(async (req, res) => {

    const { amount, pin } = req.body;

    console.log(req.body)

    const requiredFields = [amount, pin];

    if (requiredFields.some((field) => field === undefined || field.trim() === "")) {
        console.log("Fields:", requiredFields);
        throw new APIError(400, "All fields are required");
    }

    const user = await Customer.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(400, "Unauthorized request")
    }

    console.log("line 77: ", user)

    if (pin !== user.pin) {

        const transaction = await Transaction.create({
            transactionType: "deposit",
            amount,
            from: user._id,
            to: user._id,
            status: "Failed",
        })

        await Customer.findByIdAndUpdate(
            user._id,
            {
                $push: { transactions: transaction._id },
            },
            {
                new: true,
            }
        );

        throw new APIError(404, "Wrong Pin !!")
    }

    const transaction = await Transaction.create({
        transactionType: "deposit",
        amount,
        from: user._id,
        to: user._id,
        status: "Success",
    })

    if (!transaction) {
        throw new APIError(500, "Something went wrong while saving transaction")
    }

    const updateUser = await Customer.findByIdAndUpdate(
        user._id,
        {
            $inc: { balance: parseFloat(amount) },
            $push: { transactions: transaction._id },
        },
        {
            new: true,
        }
    );

    if (!updateUser) {
        throw new APIError(500, "Something went wrong while updating/saving balance.")
    }

    console.log(updateUser)

    console.log(`User Balance: ${user.balance}`)

    return res
        .status(201)
        .json(new APIResponse(201, transaction, "Transaction completed and user balances updated successfully."))

})

const withdrawAmount = asyncHandler(async (req, res) => {
    const { amount, pin } = req.body;

    console.log(req.body)

    const requiredFields = [amount, pin];

    if (requiredFields.some((field) => field === undefined || field.trim() === "")) {
        console.log("Fields:", requiredFields);
        throw new APIError(400, "All fields are required");
    }

    const user = await Customer.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(400, "Unauthorized request")
    }

    console.log("line 77: ", user)

    if (pin !== user.pin) {

        const transaction = await Transaction.create({
            transactionType: "withdraw",
            amount,
            from: user._id,
            to: user._id,
            status: "Failed",
        })

        await Customer.findByIdAndUpdate(
            user._id,
            {
                $push: { transactions: transaction._id },
            },
            {
                new: true,
            }
        );

        throw new APIError(404, "Wrong Pin !!")
    }

    if (user?.balance < amount) {
        const transaction = await Transaction.create({
            transactionType: "withdraw",
            amount,
            from: user._id,
            to: user._id,
            status: "Failed",
        })

        await Customer.findByIdAndUpdate(
            user._id,
            {
                $push: { transactions: transaction._id },
            },
            {
                new: true,
            }
        );

        throw new APIError(404, "Not Enough Balance")
    }

    const transaction = await Transaction.create({
        transactionType: "withdraw",
        amount,
        from: user._id,
        to: user._id,
        status: "Success",
    })

    if (!transaction) {
        throw new APIError(500, "Something went wrong while saving transaction")
    }

    const updateUser = await Customer.findByIdAndUpdate(
        user._id,
        {
            $inc: { balance: -parseFloat(amount) },
            $push: { transactions: transaction._id },
        },
        {
            new: true,
        }
    );

    if (!updateUser) {
        throw new APIError(500, "Something went wrong while updating/saving balance.")
    }

    console.log(updateUser)

    return res
        .status(201)
        .json(new APIResponse(201, transaction, "Transaction completed and user balances updated successfully."))
})


export { sendAmount, depositAmount, withdrawAmount}