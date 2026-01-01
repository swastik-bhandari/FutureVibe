import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    authProvider: "local" | "google";
    refreshToken?: string;
    googleId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        refreshToken: {
            type: String,
        },
        googleId: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
