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
        role: "banker",
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

    console.log(req.body)

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
        throw new APIError(404, "Password is not valid");
    }

    console.log('Banker Object:', banker);
    console.log('Provided Password:', password);
    console.log('Stored Password:', banker.password);

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(banker._id)

    const loggedInBanker = await Banker.findById(banker._id).select("-password -refreshToken")

    return res
        .status(200)
        // .cookie("accessToken", accessToken, options)
        // .cookie("refreshToken", refreshToken, options)
        .json(new APIResponse(200,
            { user: loggedInBanker, accessToken, refreshToken }
        ))
})

const logoutBanker = asyncHandler(async (req, res) => {

    if (req.user.role !== "banker") {
        throw new APIError(401, "Only authorized for bankers.")
    }

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
        // .clearCookie("accessToken", options)
        // .clearCookie("refreshToken", options)
        .json(
            new APIResponse(200, {}, "User is logged out successfully.")
        )
})

const getAllCustomers = asyncHandler(async (req, res) => {

    if (req.user.role !== "banker") {
        throw new APIError(401, "Only authorized for bankers.")
    }

    const customers = await Customer.find({}, { password: 0, refreshToken: 0, pin: 0 });

    if (!customers) {
        throw new APIError(404, "No customers found");
    }

    return res
        .status(200)
        .json(new APIResponse(200, customers, "All customers fetched successfully."));
})

const getCustomerInfo = asyncHandler(async (req, res) => {
    const { customerusername } = req.params;

    if (!customerusername) {
        throw new APIError(401, "kindly provide CustomerId")
    }

    const customer = await Customer.findOne({ username: customerusername}).select("-password -pin -refreshToken -refreshToken")

    if (!customer) {
        throw new APIError(404, "Customer not found/Exist.");
    }

    return res
        .status(200)
        .json(new APIResponse(200, customer, "User Fetched Successfully."))

})


export {
    registerBanker,
    loginBanker,
    logoutBanker,
    getAllCustomers,
    getCustomerInfo,
}