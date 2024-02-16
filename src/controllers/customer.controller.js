import { asyncHandler } from "../utils/asyncHandler.js"
import { APIResponse } from "../utils/APIResponse.js"
import { APIError } from "../utils/APIError.js"
import { Customer } from "../models/customer.model.js"


const options = {
    httpOnly: true,
    secure: true,
}

const generateAccessTokenAndRefreshTokens = async (customerId) => {
    try {

        const customer = await Customer.findById(customerId)

        const accessToken = customer.generateAccessToken()
        const refreshToken = customer.generateRefreshToken()

        customer.refreshToken = refreshToken;
        await customer.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new APIError(500,
            "Something went wrong while generating accessToken and RefreshToken")
    }
}

const registerCustomer = asyncHandler(async (req, res) => {

    const { fullName, email, username, password, pin } = req.body;

    console.log(req.body)

    const requiredFields = [fullName, email, username, password, pin];

    if (requiredFields.some((field) => field === undefined || field.trim() === "")) {
        console.log("Fields:", requiredFields);
        throw new APIError(400, "All fields are required");
    }

    const existingUser = await Customer.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new APIError(409, "User already exists")
    }

    const customer = await Customer.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        pin
    })

    const createdCustomer = await Customer.findById(customer._id).select("-password -refreshToken")

    if (!createdCustomer) {
        throw new APIError(500, "Something went wrong while registering the user.")
    }
    return res
        .status(201)
        .json(new APIResponse(200, createdCustomer, "User is registered Successfully."))
})

const loginCustomer = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new APIError(400, "Username or Email is required.")
    }

    const customer = await Customer.findOne({
        $: [{ username }, { email }]
    })

    if (!user) {
        throw new APIError(401, "User does not exist")
    }

    const isPasswordValid = await customer.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new APIError(404, "Password is not valid")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(customer._id)

    const loggedInCustomer = await Customer.findById(customer._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new APIResponse(200,
            { user: loggedInCustomer, accessToken, refreshToken }
        ))
})

const logoutCustomer = asyncHandler(async (req, res) => {
    await Customer.findByIdAndUpdate(
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
    registerCustomer,
    loginCustomer,
    logoutCustomer
}