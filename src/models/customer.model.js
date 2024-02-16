import mongoose, { Schema } from "mongoose";

const customerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    balance: {
        type: Number,
    },
    transactions: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "Transaction"
            }
        ]
    },
    passowrd: {
        type: String,
        required: true
    },
    pin: {
        type: String
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

export const Customer = mongoose.model("Customer", customerSchema)