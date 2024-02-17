import { asyncHandler } from "../utils/asyncHandler.js"
import { APIResponse } from "../utils/APIResponse.js"
import { APIError } from "../utils/APIError.js"
import { Customer } from "../models/customer.model.js"
import { Banker } from "../models/banker.model.js"


const options = {
    httpOnly: true,
    secure: true,
}

const generateAccessTokenAndRefreshTokens = async (bankerId) => {
    try {

        const banker = await Banker.findById(bankerId)

        const accessToken = banker.generateAccessToken()
        const refreshToken = banker.generateRefreshToken()

        banker.refreshToken = refreshToken;
        await banker.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new APIError(500,
            "Something went wrong while generating accessToken and RefreshToken")
    }
}

const registerBanker = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;

    console.log(req.body)

    const requiredFields = [fullName, email, username, password];

    if (requiredFields.some((field) => field === undefined || field.trim() === "")) {
        console.log("Fields:", requiredFields);
        throw new APIError(400, "All fields are required");
    }

    const existingUser = await Banker.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new APIError(409, "User already exists")
    }

    const banker = await Banker.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
    })

    const createdBanker = await Banker.findById(banker._id).select("-password -refreshToken")

    if (!createdBanker) {
        throw new APIError(500, "Something went wrong while registering the user.")
    }
    return res
        .status(201)
        .json(new APIResponse(200, createdBanker, "User is registered Successfully."))
})

const loginBanker = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new APIError(400, "Username or Email is required.")
    }

    const banker = await Banker.findOne({
        $or: [{ username }, { email }]
    })

    if (!banker) {
        throw new APIError(401, "User does not exist")
    }

    const isPasswordValid = await banker.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new APIError(404, "Password is not valid")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(banker._id)

    const loggedInBanker = await Banker.findById(banker._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new APIResponse(200,
            { user: loggedInBanker, accessToken, refreshToken }
        ))
})

const logoutBanker = asyncHandler(async (req, res) => {
    await Banker.findByIdAndUpdate(
        req.user._id, {
        $unset: {
            refreshToken: 1
        }
    },
        {
            new: true
        }
    )

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new APIResponse(200, {}, "User is logged out successfully.")
        )
})

export {
    registerBanker,
    loginBanker,
    logoutBanker
}