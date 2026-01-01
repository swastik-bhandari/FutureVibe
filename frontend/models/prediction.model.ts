import mongoose, { Schema, Model } from "mongoose";

export interface IPrediction {
    user: Schema.Types.ObjectId;
    predictionText: string;
    isPublic: boolean;
    viewsCount: number;
    imageUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const predictionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        predictionText: {
            type: String,
            required: true,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Prediction: Model<IPrediction> = mongoose.models.Prediction || mongoose.model<IPrediction>("Prediction", predictionSchema);
