import jwt from "jsonwebtoken";
import { User, IUser } from "@/models/user.model"; // Adjust import path as needed
import { AppError } from "@/lib/utils/app-error";
import { connectDatabase } from "@/lib/db";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function getCurrentUser(req: NextRequest): Promise<IUser> {
    await connectDatabase();

    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new AppError(401, "Unauthorized access");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { _id: string };
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new AppError(401, "Invalid token");
        }

        return user;
    } catch (error) {
        throw new AppError(401, "Invalid or expired token");
    }
}
