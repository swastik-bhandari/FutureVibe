import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/app-error";
import { loginUserSchema, registerUserSchema } from "../validators/validation";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/api-response";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { googleClient } from "../configs/google-client";

const environment = process.env.NODE_ENV;

//Controller to handle the user registration
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body) {
    throw new AppError(400, "Request body is missing");
  }
  const data = registerUserSchema.parse(req.body);
  const userExists = await User.findOne({ email: data.email });
  if (userExists) {
    throw new AppError(400, "User with this email already exists");
  }
  data.password = await bcrypt.hash(data.password, 10);
  await User.create(data);
  res.status(201).json(new ApiResponse(201, null, "User registered successfully"));
});

//Controller to handle user login(local auth)
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.body) {
    throw new AppError(400, "Request body is missing");
  }
  const data = loginUserSchema.parse(req.body);
  const user = await User.findOne({ email: data.email });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }
  const accessToken = await generateAccessToken(user._id.toString());
  const refreshToken = await generateRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: environment === "production",
    sameSite: environment === "production" ? "none" : "strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: environment === "production",
    sameSite: environment === "production" ? "none" : "strict",
  });
  res.status(200).json(new ApiResponse(200, { name: user.name, email: user.email, createdAt: user.createdAt }, "User logged in successfully"));
});

//Controller to handle user login via Google OAuth
export const loginWithGoogle = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    throw new AppError(400, "Token is missing");
  }
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new AppError(400, "Invalid Google token");
  }
  const { email, name, sub } = payload;
  let user = await User.findOne({ email });
  if (user && user.authProvider === "local") {
    throw new AppError(400, "Email already registered via local login. Please use email/password.");
  }
  if (!user) {
    user = await User.create({ email, name, password: null, authProvider: "google", googleId: sub });
  }
  const accessToken = await generateAccessToken(user._id.toString());
  const refreshToken = await generateRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: environment === "production",
    sameSite: environment === "production" ? "none" : "strict",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: environment === "production",
    sameSite: environment === "production" ? "none" : "strict",
  });
  res
    .status(200)
    .json(new ApiResponse(200, { name: user.name, email: user.email, createdAt: user.createdAt }, "User logged in successfully via Google"));
});
