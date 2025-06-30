"use client";

import React, { useEffect, useState } from "react";
import { useGlobal } from "../contexts/Global";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ArrowUpDown, ChevronDown, Info, Settings } from "lucide-react";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { apiUrl } from "~~/config/apiUrl";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { usePermitSign } from "~~/hooks/scaffold-eth/usePermitSign";
import { useSwapHistory } from "~~/hooks/useSwapHistory";

// Token configuration
const tokenConfigs = [
  {
    symbol: "BGT",
    name: "BuildguidlToken",
    icon: "🏗️",
    contractName: "BuildguidlToken" as const,
  },
  {
    symbol: "SPT",
    name: "SuperToken",
    icon: "⚡",
    contractName: "SuperToken" as const,
  },
];

export default function DaisyUIGaslessSwap() {
  const { address: connectedAddress, chain } = useAccount();
  const connectModal = useConnectModal();
  const {
    selectedToken: contextFromToken,
    setSelectedToken: setFromToken,
    amount: fromAmount,
    setAmount: setFromAmount,
    isLoading: isSwapping,
    setIsLoading: setIsSwapping,
    setTokenAddress,
  } = useGlobal();

  // Get deployed contract info for both tokens
  const { data: buildguidlTokenInfo } = useDeployedContractInfo({ contractName: "BuildguidlToken" });
  const { data: superTokenInfo } = useDeployedContractInfo({ contractName: "SuperToken" });

  // Create tokens array with dynamic addresses
  const tokens = tokenConfigs.map(config => {
    const contractInfo = config.contractName === "BuildguidlToken" ? buildguidlTokenInfo : superTokenInfo;
    return {
      ...config,
      address: contractInfo?.address || "0x0000000000000000000000000000000000000000", // fallback address
    };
  });

  // Get recent swap history
  const { recentSwaps, isLoading: isHistoryLoading, error: historyError } = useSwapHistory(5);

  // Provide fallback for fromToken if context is null
  const fromToken = contextFromToken || tokens[0];
  const [toToken, setToToken] = useState(tokens[1]);
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [autoSlippage, setAutoSlippage] = useState(true);
  const { signPermit, isSigning } = usePermitSign();

  // Set tokenAddress in global context when fromToken changes
  useEffect(() => {
    setTokenAddress(fromToken.address as `0x${string}`);
  }, [fromToken.address, setTokenAddress]);

  // Read balances for both tokens
  const { data: fromTokenBalance } = useScaffoldReadContract<"BuildguidlToken" | "SuperToken", "balanceOf">({
    contractName: fromToken.contractName as "BuildguidlToken" | "SuperToken",
    functionName: "balanceOf",
    args: [connectedAddress as string],
  });

  const { data: toTokenBalance } = useScaffoldReadContract<"BuildguidlToken" | "SuperToken", "balanceOf">({
    contractName: toToken.contractName as "BuildguidlToken" | "SuperToken",
    functionName: "balanceOf",
    args: [connectedAddress as string],
  });

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);

    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    console.log("swap button clicked");
    if (!connectedAddress) {
      if (connectModal?.openConnectModal) connectModal.openConnectModal();
      return;
    }
    if (!fromAmount || !toAmount || !chain) {
      alert("Please enter valid amounts");
      return;
    }
    setIsSwapping(true);
    try {
      const isSuperToBuild = fromToken.symbol === "SPT";
      const amountIn = parseFloat(fromAmount);
      const feeAmount = amountIn * 0.02; // 2% fee for display
      const totalCharge = amountIn + feeAmount; // Total in input token units (including fee)
      // Sign permit for totalCharge (input + fee)
      const permitResult = await signPermit(fromToken.name, totalCharge.toString());
      console.log("Permit signature generated:", permitResult.signature);
      // Convert amount to wei for the message
      const amountInWei = parseUnits(totalCharge.toString(), 18);
      // Construct streamlined message for the swap
      const message = {
        owner: connectedAddress,
        value: amountInWei.toString(), // Total amount (input + fee) in wei
        deadline: permitResult.deadline.toString(),
      };
      const response = await fetch(`${apiUrl}/api/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature: permitResult.signature,
          message,
          isSuperToBuild,
          tokenAddress: fromToken.address,
          chain: chain.id.toString(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status) {
        alert("Swap successful!");
        console.log("Transaction hash:", data.transactionHash);
        // Refresh the swap history after successful swap
        window.location.reload(); // Simple refresh for now
      } else {
        throw new Error(data.error || "Swap failed");
      }
    } catch (error) {
      alert(`Swap failed: ${error}`);
      console.error("Swap failed:", error);
    } finally {
      setIsSwapping(false);
    }
  };

  const TokenSelector = ({
    selectedToken,
    onSelect,
  }: {
    selectedToken: (typeof tokens)[0];
    onSelect: (token: (typeof tokens)[0]) => void;
  }) => (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-outline h-12 min-w-[140px] justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedToken.icon}</span>
          <span className="font-semibold">{selectedToken.symbol}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </div>
      <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-80 mt-2">
        <div className="p-2">
          <h3 className="font-semibold text-lg mb-3">Select a token</h3>
          <div className="space-y-1">
            {tokens.map(token => (
              <button
                key={token.symbol}
                className="btn btn-ghost w-full justify-between h-16 px-4"
                onClick={() => {
                  onSelect(token);
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{token.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-sm opacity-60">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm opacity-60">Available</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10" data-theme="gasless">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Main Swap Card */}
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-header p-6 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="card-title text-lg">Gasless Swap</h2>
              {/* Settings Modal */}
              <label htmlFor="settings-modal" className="btn btn-ghost btn-sm btn-circle">
                <Settings className="h-4 w-4" />
              </label>
            </div>
          </div>

          <div className="card-body pt-0 space-y-4">
            {/* From Token */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm opacity-60">
                <span>From</span>
                <span>
                  Balance: {fromTokenBalance ? Math.floor(Number(formatUnits(fromTokenBalance, 18))) : "0"}{" "}
                  {fromToken.symbol}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="0.0"
                    className="input input-lg w-full bg-base-200 border-0 text-xl"
                    value={fromAmount}
                    onChange={e => {
                      setFromAmount(e.target.value);
                      if (e.target.value) {
                        // Calculate output amount (1:1 ratio minus 2% fee)
                        const inputAmount = parseFloat(e.target.value);
                        const feeAmount = inputAmount * 0.02; // 2% fee
                        const outputAmount = inputAmount - feeAmount;
                        const roundedOutput = Math.round(outputAmount);
                        setToAmount(roundedOutput.toString());
                      } else {
                        setToAmount("");
                      }
                    }}
                  />
                </div>
                <TokenSelector selectedToken={fromToken} onSelect={setFromToken} />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                className="btn btn-circle bg-primary hover:bg-primary-focus text-primary-content border-0"
                onClick={handleSwapTokens}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm opacity-60">
                <span>To</span>
                <span>
                  Balance: {toTokenBalance ? Math.floor(Number(formatUnits(toTokenBalance, 18))) : "0"} {toToken.symbol}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="0.0"
                    className="input input-lg w-full bg-base-200 border-0 text-xl"
                    value={toAmount}
                    onChange={e => setToAmount(e.target.value)}
                    readOnly
                  />
                </div>
                <TokenSelector selectedToken={toToken} onSelect={setToToken} />
              </div>
            </div>

            {/* Price Info */}
            {fromAmount && toAmount && (
              <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Rate</span>
                  <span>
                    1 {fromToken.symbol} = {Math.round(0.98 * 100) / 100} {toToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Token Fee</span>
                  <span className="text-warning">2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">Price Impact</span>
                  <span className="text-success">{"<0.001%"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="opacity-60">Network Fee</span>
                  </div>

                  <div className="badge badge-success badge-sm">Gasless</div>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button
              className="btn btn-lg w-full text-lg font-semibold btn-custom-red"
              onClick={handleSwap}
              disabled={!fromAmount || !toAmount || isSigning || isSwapping}
            >
              {isSigning ? "Signing..." : isSwapping ? "Swapping..." : "Swap"}
            </button>

            {/* Info Alert */}
            <div className="alert alert-warning">
              <Info className="h-4 w-4" />
              <span className="text-sm">
                Gasless swaps are powered by meta-transactions. No ETH needed for gas fees!
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-header p-6 pb-4">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="card-body pt-0">
            {isHistoryLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : historyError ? (
              <div className="text-center py-8 text-error">
                <p>Failed to load recent activity</p>
                <p className="text-sm opacity-60">{historyError}</p>
              </div>
            ) : recentSwaps.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <p>No recent swaps yet</p>
                <p className="text-sm">Be the first to make a swap!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSwaps.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{tx.from}</span>
                        <ArrowUpDown className="h-3 w-3 opacity-60" />
                        <span className="text-sm font-medium">{tx.to}</span>
                      </div>
                      <div
                        className={`badge badge-sm ${
                          tx.status === "completed"
                            ? "badge-success"
                            : tx.status === "pending"
                              ? "badge-warning"
                              : "badge-error"
                        }`}
                      >
                        {tx.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{tx.amount}</div>
                      <div className="text-xs opacity-60">{tx.time}</div>
                      {tx.transactionHash && (
                        <div className="text-xs opacity-40 font-mono">
                          {tx.transactionHash.slice(0, 6)}...{tx.transactionHash.slice(-4)}
                        </div>
                      )}
                      {tx.userAddress && (
                        <div className="text-xs opacity-40 font-mono">
                          {tx.userAddress.slice(0, 6)}...{tx.userAddress.slice(-4)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <input type="checkbox" id="settings-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Transaction Settings</h3>

          <div className="space-y-6">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Auto Slippage</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={autoSlippage}
                  onChange={e => setAutoSlippage(e.target.checked)}
                />
              </label>
            </div>

            {!autoSlippage && (
              <div className="space-y-3">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Slippage Tolerance: {slippage}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={slippage}
                    onChange={e => setSlippage(Number.parseFloat(e.target.value))}
                    className="range range-primary"
                  />
                </div>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0].map(value => (
                    <button
                      key={value}
                      className={`btn btn-sm ${slippage === value ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-action">
            <label htmlFor="settings-modal" className="btn">
              Close
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
