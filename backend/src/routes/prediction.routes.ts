import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getPrediction, sharePrediction } from "../controllers/prediction.controller";

const router = Router();

router.post("/get-prediction", getPrediction);
router.get("/share/:id", verifyJWT, sharePrediction);

export default router;
