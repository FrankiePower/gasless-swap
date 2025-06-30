"use client";

import { useState } from "react";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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

const EIP2612Page = () => {
  const { address: connectedAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync: mintBGTAsync, isMining: isMintingBGT } = useScaffoldWriteContract("BuildguidlToken");
  const { writeContractAsync: mintSPTAsync, isMining: isMintingSPT } = useScaffoldWriteContract("SuperToken");
  const [mintStatus, setMintStatus] = useState<string>("");

  const handleMint = async (token: (typeof tokenConfigs)[0]) => {
    if (!connectedAddress) {
      if (openConnectModal) openConnectModal();
      return;
    }
    setMintStatus("");
    try {
      if (token.contractName === "BuildguidlToken") {
        await mintBGTAsync({ functionName: "mint", args: [connectedAddress, parseEther("100")] });
      } else {
        await mintSPTAsync({ functionName: "mint", args: [connectedAddress, parseEther("100")] });
      }
      setMintStatus(`Successfully minted 100 ${token.symbol}!`);
    } catch (e) {
      setMintStatus("Mint failed. See console for details.");

      console.error(e);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">What is ERC-2612?</h1>
      <div className="mb-4 text-base-content/70">
        <strong>ERC-2612</strong> lets you approve token spending <span className="font-bold">without paying gas</span>{" "}
        or needing ETH. It uses a signature instead of a regular transaction.
      </div>
      <div className="mb-6 text-base-content/60">
        <span className="font-bold">Why does this matter?</span> Normally, to let a dApp (like a swap) use your tokens,
        you have to send an &quot;approve&quot; transaction and pay gas. With ERC-2612, you just sign a message, and
        anyone (even a smart contract) can submit it for you&mdash;no ETH required!
      </div>
      <div className="w-full mb-6">
        <h2 className="text-xl font-bold mb-2">How does it work?</h2>
        <ol className="list-decimal ml-6 mb-2">
          <li>
            You sign a special message (off-chain, no gas needed) saying &quot;I allow this contract to spend my
            tokens.&quot;
          </li>
          <li>
            Anyone (even a dApp or relayer) can send that signature to the blockchain using the <code>permit</code>{" "}
            function.
          </li>
          <li>The contract checks your signature and updates your allowance&mdash;no ETH or gas from you!</li>
        </ol>
        <div className="bg-base-200 rounded p-3 text-sm mb-2">
          <span className="font-bold">In this app:</span> When you swap tokens, we use ERC-2612 &quot;permit&quot; so
          you don&apos;t need to approve or pay gas. Just sign, and swap!
        </div>
      </div>
      <div className="w-full mb-6">
        <h2 className="text-xl font-bold mb-2">Step 1: Mint tokens</h2>
        <p className="mb-2">
          Mint <span className="font-bold ">either</span> BuildguidlToken (BGT) or SuperToken (SPT) to your wallet
          below.
          <br />
        </p>
        <p className="mb-4">
          <span className="font-bold">Then, use the swap page to exchange one for the other—no ETH or gas needed!</span>
        </p>
        <div className="flex gap-4 mb-2">
          <button className="btn btn-accent" disabled={isMintingBGT} onClick={() => handleMint(tokenConfigs[0])}>
            {tokenConfigs[0].icon} Mint 100 {tokenConfigs[0].symbol}
          </button>
          <button className="btn btn-accent" disabled={isMintingSPT} onClick={() => handleMint(tokenConfigs[1])}>
            {tokenConfigs[1].icon} Mint 100 {tokenConfigs[1].symbol}
          </button>
        </div>
        {mintStatus && <div className="text-success mb-4">{mintStatus}</div>}
      </div>
      <div className="w-full mb-6">
        <h2 className="text-xl font-bold mb-2">Step 2: Try Gasless Swap</h2>
        <p className="mb-4">
          Now that you have tokens, go to the swap page and try a gasless swap using ERC-2612 permit!
          <br />
          <span className="font-bold">You can swap BGT for SPT, or SPT for BGT. it is instant and gasless.</span>
        </p>
        <div className="flex justify-center">
          <Link href="/" className="btn btn-accent text-lg px-8">
            Go to Swap
          </Link>
        </div>
      </div>
      <div className="w-full mt-8 text-xs text-base-content/50 text-center">
        Want the technical details?{" "}
        <a href="https://eips.ethereum.org/EIPS/eip-2612" target="_blank" className="underline">
          Read the full ERC-2612 spec
        </a>
        .
      </div>
    </div>
  );
};

export default EIP2612Page;
