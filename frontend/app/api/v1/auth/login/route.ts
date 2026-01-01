import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { loginUserSchema } from "@/lib/validators/validation";
import { AppError } from "@/lib/utils/app-error";
import { ApiResponse } from "@/lib/utils/api-response";
import { generateAccessToken, generateRefreshToken } from "@/lib/utils/token";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = loginUserSchema.safeParse(body);
        if (!validation.success) {
            throw new AppError(400, "Validation Failed", validation.error.issues);
        }
        const data = validation.data;

        await connectDatabase();

        const user = await User.findOne({ email: data.email });
        if (!user) {
            throw new AppError(401, "Invalid email or password");
        }

        // Explicitly check if password exists (could be Google auth user)
        if (!user.password) {
            throw new AppError(400, "Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new AppError(401, "Invalid email or password");
        }

        const accessToken = await generateAccessToken(user._id.toString());
        const refreshToken = await generateRefreshToken(user._id.toString());

        user.refreshToken = refreshToken;
        await user.save();

        const cookieStore = await cookies();
        const environment = process.env.NODE_ENV;

        cookieStore.set("accessToken", accessToken, {
            httpOnly: true,
            secure: environment === "production",
            sameSite: environment === "production" ? "none" : "strict",
        });

        cookieStore.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: environment === "production",
            sameSite: environment === "production" ? "none" : "strict",
        });

        return NextResponse.json(
            new ApiResponse(
                200,
                { name: user.name, email: user.email, createdAt: user.createdAt },
                "User logged in successfully"
            ),
            { status: 200 }
        );
    } catch (error: any) {
        const status = error.statusCode || 500;
        const message = error.message || "Internal Server Error";
        return NextResponse.json(
            new ApiResponse(status, null, message),
            { status }
        );
    }
}
