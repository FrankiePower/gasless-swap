"use client";

import React, { createContext, useContext, useState } from "react";
import { Address } from "viem";

export const GlobalContext = createContext<any>(null);

export function useGlobal() {
  return useContext(GlobalContext);
}

export function GlobalProvider({ children }: React.PropsWithChildren) {
  // You may want to initialize state with tokens[0] if you import tokens from config
  const [tokenAddress, setTokenAddress] = useState<Address | null>(null);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [fee, setFee] = useState<bigint>(BigInt(0));
  const [total, setTotal] = useState<bigint>(BigInt(0));
  const [showFee, setShowFee] = useState<boolean>(false);
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  return (
    <GlobalContext.Provider
      value={{
        tokenAddress,
        setTokenAddress,
        selectedToken,
        setSelectedToken,
        userBalance,
        setUserBalance,
        fee,
        setFee,
        total,
        setTotal,
        showFee,
        setShowFee,
        receiverAddress,
        setReceiverAddress,
        isLoading,
        setIsLoading,
        amount,
        setAmount,
        isOpen,
        setIsOpen,
        showTransactionDetails,
        setShowTransactionDetails,
        error,
        setError,
        isSuccess,
        setIsSuccess,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
