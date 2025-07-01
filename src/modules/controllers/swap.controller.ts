import { Request, Response } from "express";
import { SwapMessage, swapGasless } from "../services/swap.service";
import { getRpcUrl } from "../../common/utils/rpcUtil";
import { getContract } from "../../common/config/contracts";

export const swapController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { signature, message, isSuperToBuild, tokenAddress, chain } = req.body;

  console.log("Swap request:", { signature, message, isSuperToBuild, tokenAddress, chain });

  try {
    const rpcUrl = getRpcUrl(String(chain).toUpperCase());
    const SWAP_CONTRACT_ADDRESS = getContract(String(chain).toLowerCase());

    // Validate inputs
    if (!rpcUrl) {
      res.status(500).json({
        status: false,
        message: "RPC URL not found",
      });
      return;
    }
    if (!SWAP_CONTRACT_ADDRESS) {
      res.status(500).json({
        status: false,
        message: "Swap contract address not found",
      });
      return;
    }
    if (!signature) {
      res.status(400).json({
        status: false,
        message: "Signature not found",
      });
      return;
    }
    if (!message) {
      res.status(400).json({
        status: false,
        message: "Message not found",
      });
      return;
    }
    if (typeof isSuperToBuild !== "boolean") {
      res.status(400).json({
        status: false,
        message: "Swap direction not specified",
      });
      return;
    }
    if (!tokenAddress) {
      res.status(400).json({
        status: false,
        message: "Token address not found",
      });
      return;
    }
    if (!chain) {
      res.status(400).json({
        status: false,
        message: "Chain not specified",
      });
      return;
    }

    // Validate tokenAddress (BGT or SPT)
    // TODO: Add proper validation later
    // const validTokens = [
    //   "0x8c56bcb0aA14f67d653340652Bd9C9273298FdB3", // BGT
    //   "0x9a7d82ADc5df5B2E516c432db1EcAFE5Aaf069a3" // SPT
    // ];
    // if (!validTokens.includes(tokenAddress.toLowerCase())) {
    //   res.status(400).json({
    //     status: false,
    //     message: "Invalid token address",
    //   });
    //   return;
    // }

    // Validate message fields
    const messageObject = message as SwapMessage;
    if (!messageObject.owner || !messageObject.value || !messageObject.deadline) {
      res.status(400).json({
        status: false,
        message: "Invalid message: missing owner, value, or deadline",
      });
      return;
    }

    try {
      const txHash = await swapGasless(
        signature,
        messageObject,
        isSuperToBuild,
        tokenAddress,
        SWAP_CONTRACT_ADDRESS,
        rpcUrl,
        String(chain).toLowerCase()
      );
      res.status(200).json({ 
        status: true, 
        message: "Swap executed successfully",
        transactionHash: txHash
      });
    } catch (err: any) {
      console.error("Swap error:", err);
      res.status(400).json({
        status: false,
        message: err.reason || err.message || "Swap failed",
        error: err
      });
    }
  } catch (err: any) {
    console.error("Swap controller error:", err);
    res.status(500).json({ 
      status: false, 
      message: "Internal server error", 
      error: err 
    });
  }
};