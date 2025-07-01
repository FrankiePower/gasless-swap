export const getRpcUrl = (chain: string) => {
  if (chain === "11155111") {
    return process.env[`RPC_URL_SEPOLIA`];
  }
  return process.env[`RPC_URL_${chain}`];
};
