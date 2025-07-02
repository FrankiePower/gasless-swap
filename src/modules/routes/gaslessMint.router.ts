import { Router } from "express";
import { gaslessMintController } from "../controllers/gaslessMint.controller";

const router = Router();

router.post("/gasless-mint", gaslessMintController);

export default router; 