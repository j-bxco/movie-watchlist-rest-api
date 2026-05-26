import express from "express";
import { register, login, logout } from "../controllers/authController.js"
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema, 'body'), register);
router.post("/login", validateRequest(loginSchema, 'body'), login);
router.post("/logout", logout);

export default router;