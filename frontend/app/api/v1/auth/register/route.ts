import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/db";
import { User } from "@/models/user.model";
import { registerUserSchema } from "@/lib/validators/validation";
import { AppError } from "@/lib/utils/app-error";
import { ApiResponse } from "@/lib/utils/api-response";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = registerUserSchema.safeParse(body);
        if (!validation.success) {
            throw new AppError(400, "Validation Failed", validation.error.issues);
        }
        const data = validation.data;

        await connectDatabase();

        const userExists = await User.findOne({ email: data.email });
        if (userExists) {
            throw new AppError(400, "User with this email already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        await User.create({ ...data, password: hashedPassword });

        return NextResponse.json(
            new ApiResponse(201, null, "User registered successfully"),
            { status: 201 }
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
