import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { AppError } from "@/lib/utils/app-error";
import { ApiResponse } from "@/lib/utils/api-response";
import { generateAccessToken, generateRefreshToken } from "@/lib/utils/token";
import { googleClient } from "@/lib/configs/google-client";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            throw new AppError(400, "Token is missing");
        }

        await connectDatabase();

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new AppError(400, "Invalid Google token");
        }

        const { email, name, sub } = payload;

        if (!email || !name || !sub) {
            throw new AppError(400, "Incomplete Google profile data");
        }

        let user = await User.findOne({ email });

        if (user && user.authProvider === "local") {
            throw new AppError(400, "Email already registered via local login. Please use email/password.");
        }

        if (!user) {
            user = await User.create({
                email,
                name,
                password: "", // Mongoose schema might valid this, ensure required is conditional or handled
                authProvider: "google",
                googleId: sub,
            });
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
                "User logged in successfully via Google"
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
