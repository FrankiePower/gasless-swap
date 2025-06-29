type ContractConfig = {
  [chain: string]: string;
};

export const contract: ContractConfig = {
  // Sepolia testnet - the only chain currently supported
  "11155111": "0xE4494FbE3fbfdF89F408CB6c8cF9A50b213D4373",  // SwapContract
};

export const getContract = (chain: string) => {
  const contractAddress = contract[chain];
  if (!contractAddress) {
    throw new Error(`No contract configuration found for chain ${chain}`);
  }
  return contractAddress;
};
  