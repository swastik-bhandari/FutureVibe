import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/db";
import { Prediction } from "@/models/prediction.model";
import { AppError } from "@/lib/utils/app-error";
import { ApiResponse } from "@/lib/utils/api-response";
import { getCurrentUser } from "@/lib/middlewares/auth";
import { ShareResponse } from "@/types/types";

// Note: verifyJWT in original code was used on this route.
// We should check auth here or if it's public.
// Original route: router.get("/share/:id", verifyJWT, sharePrediction);
// So it IS protected.

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Verify Auth
        await getCurrentUser(req);

        const { id } = await params;

        await connectDatabase();

        const prediction = await Prediction.findById(id).populate<{ user: { name: string } }>("user", "name");

        if (!prediction) {
            throw new AppError(404, "Prediction not found");
        }

        prediction.isPublic = true;
        prediction.viewsCount += 1;
        await prediction.save();

        const result: ShareResponse = {
            id: prediction._id.toString(),
            userName: prediction.user.name,
            predictionText: prediction.predictionText,
            imageUrl: prediction.imageUrl,
            viewsCount: prediction.viewsCount,
        };

        return NextResponse.json(
            new ApiResponse(200, result, "Prediction shared successfully"),
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
