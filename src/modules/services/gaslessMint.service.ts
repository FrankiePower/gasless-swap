import { ethers } from "ethers";
import { buildguidlToken, superToken } from "../../common/config/contracts";

const tokenAbi = ["function mint(address to, uint256 amount)"];

export const gaslessMintService = async (message: any, signature: string): Promise<string> => {
  // Determine token contract address
  let tokenAddress: string;
  let tokenName: string;
  if (message.token === "BGT") {
    tokenAddress = buildguidlToken["11155111"];
    tokenName = "BuildguidlToken";
  } else if (message.token === "SPT") {
    tokenAddress = superToken["11155111"];
    tokenName = "SuperToken";
  } else {
    throw new Error("Unsupported token");
  }

  // EIP-712 domain and types
  const domain = {
    name: tokenName,
    version: "1",
    chainId: 11155111,
    verifyingContract: tokenAddress,
  };
  const types = {
    Mint: [
      { name: "action", type: "string" },
      { name: "token", type: "string" },
      { name: "amount", type: "string" },
      { name: "to", type: "address" },
    ],
  };

  // Verify signature using ethers
  const recovered = ethers.verifyTypedData(domain, types, message, signature);
  if (recovered.toLowerCase() !== message.to.toLowerCase()) {
    throw new Error("Invalid signature");
  }

  // Mint tokens
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL_SEPOLIA);
  const relayer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  const token = new ethers.Contract(tokenAddress, tokenAbi, relayer);
  const tx = await token.mint(message.to, ethers.parseUnits(message.amount, 18));
  await tx.wait();
  return tx.hash;
}; 