import { ethers } from "ethers";
import dotenv from "dotenv";
import { logSwapTransaction } from "./swapHistory.service";
dotenv.config();

export interface SwapMessage {
  owner: string;
  value: string;
  deadline: string;
}

const SPENDER_PRIVATE_KEY = process.env.PRIVATE_KEY as string;

if (!SPENDER_PRIVATE_KEY) {
  throw new Error("Missing SPENDER_PRIVATE_KEY environment variable");
}

export const swapGasless = async (
  signature: string,
  message: SwapMessage,
  isSuperToBuild: boolean,
  tokenAddress: string,
  contractAddress: string,
  rpcUrl: string,
  chain: string
): Promise<string> => {
  console.log("=== SWAP SERVICE DEBUG ===");
  console.log("Input parameters:");
  console.log("- signature:", signature);
  console.log("- message:", message);
  console.log("- isSuperToBuild:", isSuperToBuild);
  console.log("- tokenAddress:", tokenAddress);
  console.log("- contractAddress:", contractAddress);
  console.log("- rpcUrl:", rpcUrl);
  console.log("- chain:", chain);

  // Validate tokenAddress
  const validTokens = [
    "0x341b3060C5dC9BDBbb3E6D1f01b09c1A5B76d22C", // BGT
    "0x9359c395Ef76af7A17E46b6F559CE0997FEC31E3" // SPT
  ];
  // if (!validTokens.includes(tokenAddress.toLowerCase())) {
  //   throw new Error("Invalid token address");
  // }

  // Convert message.value to BigInt
  const amountInWei = BigInt(message.value);

  // Extract v, r, s from signature
  const { v, r, s } = ethers.Signature.from(signature);

  // Create provider and wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const spenderWallet = new ethers.Wallet(SPENDER_PRIVATE_KEY, provider);

  console.log("=== CONTRACT SETUP ===");
  console.log("Provider created");
  console.log("Wallet address:", spenderWallet.address);

  // Check contract balances before swap
  const tokenAbi = ["function balanceOf(address owner) view returns (uint256)"];
  
  const superTokenAddress = "0x9359c395Ef76af7A17E46b6F559CE0997FEC31E3";
  const buildguidlTokenAddress = "0x341b3060C5dC9BDBbb3E6D1f01b09c1A5B76d22C";
  
  const superTokenContract = new ethers.Contract(superTokenAddress, tokenAbi, provider);
  const buildguidlTokenContract = new ethers.Contract(buildguidlTokenAddress, tokenAbi, provider);
  
  const superTokenBalance = await superTokenContract.balanceOf(contractAddress);
  const buildguidlTokenBalance = await buildguidlTokenContract.balanceOf(contractAddress);
  
  console.log("=== CONTRACT BALANCES ===");
  console.log("SuperToken balance in contract:", ethers.formatEther(superTokenBalance));
  console.log("BuildguidlToken balance in contract:", ethers.formatEther(buildguidlTokenBalance));

  // Calculate expected output
  const feeAmount = (amountInWei * BigInt(2)) / BigInt(100); // 2% fee
  const amountOut = amountInWei - feeAmount;
  
  console.log("=== SWAP CALCULATIONS ===");
  console.log("Amount in (wei):", amountInWei.toString());
  console.log("Fee amount (wei):", feeAmount.toString());
  console.log("Amount out (wei):", amountOut.toString());
  console.log("Amount out (ether):", ethers.formatEther(amountOut));
  
  // Check if contract has enough tokens
  const requiredBalance = isSuperToBuild ? buildguidlTokenBalance : superTokenBalance;
  console.log("Required balance:", ethers.formatEther(requiredBalance));
  console.log("Has sufficient balance:", requiredBalance >= amountOut);

  console.log("Preparing to call SwapContract...");
  console.log("Swap direction:", isSuperToBuild ? "SuperToken → BuildguidlToken" : "BuildguidlToken → SuperToken");
  console.log("Owner:", message.owner);
  console.log("Amount In (wei):", amountInWei.toString());
  console.log("Deadline:", message.deadline);
  console.log("Token Address:", tokenAddress);
  console.log("Contract:", contractAddress);
  console.log("v:", v);
  console.log("r:", r);
  console.log("s:", s);

  // SwapContract ABI
  const swapContractAbi = [
    "function swap(bool isSuperToBuild, address _owner, uint256 _amountIn, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external",
  ];

  // Create contract instance
  const swapContract = new ethers.Contract(
    contractAddress,
    swapContractAbi,
    spenderWallet
  );

  // Call the swap function
  try {
    console.log("=== CALLING SWAP FUNCTION ===");
    const tx = await swapContract.swap(
      isSuperToBuild,
      message.owner,
      amountInWei,
      message.deadline,
      v,
      r,
      s
    );
    console.log("Swap transaction sent, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Gasless swap successful:", receipt);

    // Log the swap transaction to database
    try {
      const fromToken = isSuperToBuild 
        ? { symbol: "SPT", name: "SuperToken", address: superTokenAddress }
        : { symbol: "BGT", name: "BuildguidlToken", address: buildguidlTokenAddress };
      
      const toToken = isSuperToBuild 
        ? { symbol: "BGT", name: "BuildguidlToken", address: buildguidlTokenAddress }
        : { symbol: "SPT", name: "SuperToken", address: superTokenAddress };

      await logSwapTransaction({
        userAddress: message.owner,
        fromToken,
        toToken,
        amountIn: amountInWei.toString(),
        amountOut: amountOut.toString(),
        feeAmount: feeAmount.toString(),
        transactionHash: receipt.hash,
        chainId: chain,
        blockNumber: receipt.blockNumber,
      });
      
      console.log("Swap transaction logged to database successfully");
    } catch (logError) {
      console.error("Failed to log swap transaction:", logError);
      // Don't throw here - the swap was successful, just logging failed
    }

    return receipt;
  } catch (error: any) {
    console.error("=== SWAP ERROR DETAILS ===");
    console.error("Error code:", error.data);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    throw new Error(`Swap failed: ${error.message}`);
  }
};