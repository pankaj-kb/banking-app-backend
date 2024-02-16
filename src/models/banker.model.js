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
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

bankerSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.passoword = await bcrypt.hash(this.passowrd, 10)
        next();
    } else {
        return next();
    }
})

bankerSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.passowrd)
}

bankerSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.passoword = await bcrypt.hash(this.passowrd, 10)
        next();
    } else {
        return next();
    }
})

bankerSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        username: this.username,
        fullName: this.fullName
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}

bankerSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const Banker = mongoose.model("Banker", bankerSchema)