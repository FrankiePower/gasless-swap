type ContractConfig = {
  [chain: string]: string;
};

export const contract: ContractConfig = {
  // Sepolia testnet - the only chain currently supported
  "11155111": "0x571B4228e412fC2ebaA209a75651BDE93ce4B4c2",  // SwapContract
};

export const getContract = (chain: string) => {
  const contractAddress = contract[chain];
  if (!contractAddress) {
    throw new Error(`No contract configuration found for chain ${chain}`);
  }
  return contractAddress;
};
  