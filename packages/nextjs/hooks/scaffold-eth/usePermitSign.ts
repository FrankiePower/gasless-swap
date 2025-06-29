"use client";

import { useGlobal } from "../../contexts/Global";
import { parseUnits } from "viem";
import { useAccount, useReadContract, useSignTypedData } from "wagmi";

const PERMIT_ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

// Hardcoded spender address (swap contract)
const SPENDER_ADDRESS = "0xE4494FbE3fbfdF89F408CB6c8cF9A50b213D4373" as `0x${string}`;

export const usePermitSign = () => {
  const { address, chain } = useAccount();
  const { tokenAddress } = useGlobal();
  const { signTypedDataAsync, isPending: isSigning } = useSignTypedData();

  // Fetch nonce for the user from the token address
  const { data: nonce } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: PERMIT_ABI,
    functionName: "nonces",
    args: address ? [address] : undefined,
  });

  const signPermit = async (
    tokenName: string,
    value: string, // Amount as string (e.g., "100.5")
    decimals: number = 18, // Default to 18 decimals
  ): Promise<{ signature: string; deadline: bigint }> => {
    if (!address || !chain || !tokenAddress) {
      throw new Error("Wallet not connected, chain not detected, or token not selected");
    }

    if (nonce === undefined) {
      throw new Error("Failed to fetch nonce");
    }

    // Format the value to token decimals
    const formattedValue = parseUnits(value, decimals);

    // Set deadline to 1 hour from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    // EIP-712 domain
    const domain = {
      name: tokenName,
      version: "1",
      chainId: chain.id,
      verifyingContract: tokenAddress as `0x${string}`,
    };

    // EIP-712 types
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    // EIP-712 message
    const message = {
      owner: address,
      spender: SPENDER_ADDRESS,
      value: formattedValue,
      nonce,
      deadline,
    };

    try {
      const signatureHex = await signTypedDataAsync({
        domain,
        types,
        primaryType: "Permit",
        message,
      });

      return { signature: signatureHex, deadline };
    } catch (error) {
      console.error("Error signing permit:", error);
      throw error;
    }
  };

  return {
    signPermit,
    isSigning,
  };
};
