"use client";

import { useState } from "react";
import Link from "next/link";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSignTypedData } from "wagmi";
import { apiUrl } from "~~/config/apiUrl";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

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
  const { signTypedDataAsync } = useSignTypedData();
  const [gaslessMintStatus, setGaslessMintStatus] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const { data: buildguidlTokenInfo } = useDeployedContractInfo({ contractName: "BuildguidlToken" });
  const { data: superTokenInfo } = useDeployedContractInfo({ contractName: "SuperToken" });
  const [signingToken, setSigningToken] = useState<string | null>(null);

  const handleGaslessMint = async (token: (typeof tokenConfigs)[0]) => {
    if (!connectedAddress) {
      if (openConnectModal) openConnectModal();
      return;
    }
    setGaslessMintStatus("");
    setSigningToken(token.symbol);
    try {
      // Get the correct verifyingContract address
      let verifyingContract = "0x0000000000000000000000000000000000000000";
      if (token.contractName === "BuildguidlToken" && buildguidlTokenInfo?.address) {
        verifyingContract = buildguidlTokenInfo.address;
      } else if (token.contractName === "SuperToken" && superTokenInfo?.address) {
        verifyingContract = superTokenInfo.address;
      }
      // Prepare EIP-712 domain and types
      const domain = {
        name: token.name,
        version: "1",
        chainId: 11155111, // Hardhat default, replace with correct chainId if needed
        verifyingContract,
      };
      const types = {
        Mint: [
          { name: "action", type: "string" },
          { name: "token", type: "string" },
          { name: "amount", type: "string" },
          { name: "to", type: "address" },
        ],
      };
      const message = {
        action: "mint",
        token: token.symbol,
        amount: "100",
        to: connectedAddress,
      };
      // Sign the message
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: "Mint",
        message,
      });
      console.log("Gasless mint signature:", signature);
      // Send to backend
      const response = await fetch(`${apiUrl}/api/mint/gasless-mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        // Show success modal instead of status message
        setTxHash(data.txHash);
        const modal = document.getElementById("gasless-mint-success-modal") as HTMLDialogElement;
        if (modal) {
          modal.showModal();
        }
        setGaslessMintStatus(""); // Clear any previous status
      } else {
        setGaslessMintStatus(`Gasless mint failed: ${data.error || data.message}`);
      }
    } catch (e) {
      setGaslessMintStatus("Gasless mint failed. See console for details.");
      console.error(e);
    } finally {
      setSigningToken(null);
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
          <span className="font-bold">Then, use the swap page to exchange one for the other—no ETH/Gas needed!</span>
        </p>
        <div className="flex gap-4 mb-2">
          <button
            className="btn btn-primary border-white"
            disabled={signingToken !== null}
            onClick={() => handleGaslessMint(tokenConfigs[0])}
          >
            {signingToken === "BGT" ? "Minting..." : `Gasless Mint 100 ${tokenConfigs[0].symbol}`}
          </button>
          <button
            className="btn btn-primary border-white"
            disabled={signingToken !== null}
            onClick={() => handleGaslessMint(tokenConfigs[1])}
          >
            {signingToken === "SPT" ? "Minting..." : `Gasless Mint 100 ${tokenConfigs[1].symbol}`}
          </button>
        </div>
        {gaslessMintStatus && <div className="text-info mb-4">{gaslessMintStatus}</div>}
      </div>
      <div className="w-full mb-4">
        <h2 className="text-xl font-bold mb-2">Step 2: Try Gasless Swap</h2>
        <p className="mb-4">
          Now that you have tokens, go to the swap page and try a gasless swap using ERC-2612 permit!
          <br />
          <br />
          <span className="font-bold">You can swap BGT for SPT, or SPT for BGT. it is instant and gasless.</span>
        </p>
        <div className="flex justify-center">
          <Link href="/" className="btn btn-accent border-white text-lg px-8">
            Go to Swap
          </Link>
        </div>
      </div>
      <div className="w-full mt-4 text-xs text-base-content/50 text-center">
        Want more technical details?{" "}
        <a href="https://eips.ethereum.org/EIPS/eip-2612" target="_blank" className="underline">
          Read the full ERC-2612 spec
        </a>
        .
      </div>

      {/* Success Modal */}
      <dialog id="gasless-mint-success-modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-success">🎉 Gasless Mint Successful!</h3>
          <p className="py-4">Your tokens have been minted successfully using gasless transactions. No ETH needed!</p>
          <div className="bg-base-200 p-3 rounded-lg mb-4">
            <p className="text-sm font-mono break-all">Tx: {txHash || "Transaction hash not available"}</p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-success">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default EIP2612Page;
