import mongoose from "mongoose";

const bankerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    role: {
        type: String,
    },
    passowrd: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

export const Banker = mongoose.model("Banker", bankerSchema)