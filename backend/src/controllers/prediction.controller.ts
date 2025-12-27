import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { Prediction } from "../models/prediction.model";
import { ShareResponse } from "../types/types";
import { ApiResponse } from "../utils/api-response";

export const getPrediction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.body;
  //Feature to be implemented -> 

  //Step-1: Call the FastAPI prediction endpoint with the provided id

  //Step-2: Save into the database for future reference

  //Step-3: Return the response to the client
});

export const sharePrediction = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const prediction = await Prediction.findById(id).populate<{ user: { name: string } }>("user", "name");
  if (!prediction) {
    return res.status(404).json({ message: "Prediction not found" });
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
  return res.status(200).json(new ApiResponse(200, result, "Prediction shared successfully"));
});
