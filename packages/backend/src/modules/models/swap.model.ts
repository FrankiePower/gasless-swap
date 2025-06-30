import mongoose, { Schema, Document } from "mongoose";

export interface ISwap extends Document {
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
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  blockNumber?: number;
}

const SwapSchema: Schema = new Schema({
  userAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  fromToken: {
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true, lowercase: true },
  },
  toToken: {
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true, lowercase: true },
  },
  amountIn: {
    type: String,
    required: true,
  },
  amountOut: {
    type: String,
    required: true,
  },
  feeAmount: {
    type: String,
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true,
  },
  chainId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  blockNumber: {
    type: Number,
  },
});

// Index for efficient queries
SwapSchema.index({ userAddress: 1, timestamp: -1 });
SwapSchema.index({ transactionHash: 1 });
SwapSchema.index({ timestamp: -1 });

export const Swap = mongoose.model<ISwap>("Swap", SwapSchema); 