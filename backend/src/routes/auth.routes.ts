import { Router } from "express";
import { loginUser, loginWithGoogle, registerUser } from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login/google", loginWithGoogle);

export default router;
