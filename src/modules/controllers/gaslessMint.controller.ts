import { Request, Response } from "express";
import { gaslessMintService } from "../services/gaslessMint.service";

export const gaslessMintController = async (req: Request, res: Response) => {
  try {
    const { message, signature } = req.body;
    const result = await gaslessMintService(message, signature);
    res.status(200).json({ status: "success", txHash: result });
  } catch (err: any) {
    res.status(400).json({ status: "error", error: err.message || err });
  }
}; 