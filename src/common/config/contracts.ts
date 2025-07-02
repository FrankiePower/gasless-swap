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

export const buildguidlToken = {
  "11155111": "0x341b3060c5dc9bdbbb3e6d1f01b09c1a5b76d22c" // Replace with actual address
};

export const superToken = {
  "11155111": "0x9359c395ef76af7a17e46b6f559ce0997fec31e3" // Replace with actual address
};
  