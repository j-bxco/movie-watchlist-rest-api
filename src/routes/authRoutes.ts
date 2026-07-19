import express from "express";
import { register, login, logout } from "../controllers/authController.js"
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import { authLoginLimiter, authRegisterLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/register", authRegisterLimiter, validateRequest(registerSchema, 'body'), register);
router.post("/login", authLoginLimiter, validateRequest(loginSchema, 'body'), login);
router.post("/logout", logout);

export default router;