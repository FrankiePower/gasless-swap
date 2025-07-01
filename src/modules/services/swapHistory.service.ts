import { Swap, ISwap } from "../models/swap.model";
import { ethers } from "ethers";

export interface SwapLogData {
  userAddress: string;
  fromToken: {
    symbol: string;
    name: string;
    address: string;
  };
  toToken: {
    symbol: string;
    name: string;
    address: string;
  };
  amountIn: string;
  amountOut: string;
  feeAmount: string;
  transactionHash: string;
  chainId: string;
  blockNumber?: number;
}

export const logSwapTransaction = async (swapData: SwapLogData): Promise<ISwap> => {
  try {
    const swap = new Swap({
      ...swapData,
      status: "completed",
      timestamp: new Date(),
    });

    const savedSwap = await swap.save();
    console.log(`Swap logged successfully: ${savedSwap.transactionHash}`);
    return savedSwap;
  } catch (error) {
    console.error("Error logging swap transaction:", error);
    throw new Error("Failed to log swap transaction");
  }
};

export const getRecentSwaps = async (limit: number = 10): Promise<ISwap[]> => {
  try {
    const swaps = await Swap.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select("userAddress fromToken toToken amountIn amountOut timestamp status transactionHash");
    
    return swaps;
  } catch (error) {
    console.error("Error fetching recent swaps:", error);
    throw new Error("Failed to fetch recent swaps");
  }
};

export const getUserSwaps = async (userAddress: string, limit: number = 20): Promise<ISwap[]> => {
  try {
    const swaps = await Swap.find({ 
      userAddress: userAddress.toLowerCase() 
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select("fromToken toToken amountIn amountOut timestamp status transactionHash");
    
    return swaps;
  } catch (error) {
    console.error("Error fetching user swaps:", error);
    throw new Error("Failed to fetch user swaps");
  }
};

export const formatSwapForDisplay = (swap: ISwap) => {
  const amountIn = ethers.formatEther(swap.amountIn);
  const amountOut = ethers.formatEther(swap.amountOut);
  
  return {
    from: swap.fromToken.symbol,
    to: swap.toToken.symbol,
    amount: Math.floor(Number(amountIn)),
    time: getTimeAgo(swap.timestamp),
    status: swap.status,
    transactionHash: swap.transactionHash || "",
    userAddress: swap.userAddress || "",
  };
};

const getTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}; 