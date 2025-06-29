import { Router } from "express";
import {
  
  
  swapController
} from "../controllers/swap.controller";

const router = Router();

router.post("/swap", swapController);

export default router;
