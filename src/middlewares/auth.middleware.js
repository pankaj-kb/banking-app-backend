import { Customer } from "../models/customer.model.js";
import { Banker } from "../models/banker.model.js"
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new APIError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const findUserById = async (userId) => {
            return await Customer.findById(userId).select("-password -refreshToken") || await Banker.findById(userId).select("-password -refreshToken");
        };

        const user = await findUserById(decodedToken?._id);

        if (!user) {
            throw new APIError(401, "Authentication Error.");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        throw new APIError(401, error?.message || "Invalid Access token");
    }
});
