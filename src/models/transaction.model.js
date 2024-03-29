import mongoose, { Schema } from "mongoose";

const transactionSchema = new mongoose.Schema({
    transactionType: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
}, { timestamps: true })

export const Transaction = mongoose.model("Transaction", transactionSchema)