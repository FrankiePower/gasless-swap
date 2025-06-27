import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import { Message } from "../../common/interfaces/Imessage";
import { getContract } from "../../common/config/contracts";

// the private key used in the deployer of the swap contract (OWNER)
const SPENDER_PRIVATE_KEY = process.env.PRIVATE_KEY as string;

// check if all the required environment variables are set
if (!SPENDER_PRIVATE_KEY) {
  throw new Error("Missing required environment variables");
}

// the function to execute the swap using the SwapContract
export const swapGasless = async (
  signature: string,
  message: Message,
  isSuperToBuild: boolean,
  amountIn: string,
  deadline: string,
  to: string,
  fee: string,
  rpcUrl: string,
  chain: string
) => {
  const SWAP_CONTRACT_ADDRESS = getContract(chain);

  // Convert raw amounts to wei
  const amountInWei = ethers.parseUnits(amountIn, 18);
  const feeWei = ethers.parseUnits(fee, 18);

  // extract the v, r, s from the signature
  const { v, r, s } = ethers.Signature.from(signature);

  // create a provider
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // create a wallet with the private key
  const spenderWallet = new ethers.Wallet(SPENDER_PRIVATE_KEY, provider);

  console.log("Preparing to call SwapContract...");
  console.log("Swap direction:", isSuperToBuild ? "SuperToken → BuildguidlToken" : "BuildguidlToken → SuperToken");
  console.log("From:", message.owner);
  console.log("To:", to);
  console.log("Amount In (raw):", amountIn);
  console.log("Amount In (wei):", amountInWei.toString());
  console.log("Fee (raw):", fee);
  console.log("Fee (wei):", feeWei.toString());
  console.log("Deadline:", deadline);
  console.log("Contract:", SWAP_CONTRACT_ADDRESS);
  console.log("v:", v);
  console.log("r:", r);
  console.log("s:", s);

  // SwapContract ABI
  const swapContractAbi = [
    "function swap(bool isSuperToBuild, address _from, uint256 _amountIn, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external",
  ];

  // Create contract instance with signer directly
  const swapContract = new ethers.Contract(
    SWAP_CONTRACT_ADDRESS,
    swapContractAbi,
    spenderWallet
  );

  // Call the `swap` function
  try {
    const tx = await swapContract.swap(
      isSuperToBuild,
      message.owner,
      amountInWei,
      deadline,
      v,
      r,
      s,
    );
    console.log("Swap transaction sent, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Gasless swap successful:", receipt.transactionHash);
    return receipt.transactionHash;
  } catch (error: any) {
    console.error("Gasless swap failed:", error);
    throw error;
  }
}; 