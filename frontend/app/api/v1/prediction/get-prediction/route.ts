import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/utils/app-error";
import { ApiResponse } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        //Feature to be implemented -> 
        //Step-1: Call the FastAPI prediction endpoint with the provided id
        //Step-2: Save into the database for future reference
        //Step-3: Return the response to the client

        // Placeholder response until logic is added
        return NextResponse.json(
            new ApiResponse(200, { message: "Prediction logic placeholder" }, "Success"),
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
