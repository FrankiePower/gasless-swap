
# ⚡ Gasless Swap

<h4 align="center">
  <em>Swap tokens instantly and gaslessly using EIP-2612 permits and a backend relayer</em>
</h4>

Gasless Swap is a decentralized application (dApp) that enables users to swap between two ERC-20 tokens—BuildguidlToken (BGT) and SuperToken (SPT)—with a 2% fee, using EIP-2612 "permit" signatures for gasless approvals. Users do not need ETH to approve or swap; they simply sign a message, and a backend relayer submits the transaction on-chain.

---
<img width="1438" alt="Screenshot 2025-07-02 at 10 24 33" src="https://github.com/user-attachments/assets/d1516f70-ea04-4d70-93f4-622d06636df4" />

---

## 🚀 Features

- **Truly Gasless Swaps:** Users swap tokens without paying gas for approvals or swaps, thanks to EIP-2612 permits and a backend relayer.
- **EIP-2612 Permit Integration:** Uses off-chain signatures for token approvals, enabling a seamless, gasless user experience.
- **2% Swap Fee:** Each swap charges a 2% fee, deducted from the input amount.
- **Instant 1:1 Swaps:** Swap between BGT and SPT instantly at a 1:1 rate (minus fee).
- **Open Minting:** Both tokens can be minted by anyone, with per-transaction and total supply caps.
- **Swap History:** Users can view their recent swaps directly in the UI.
- **Modern UI:** Built with Next.js, RainbowKit, Wagmi, and Typescript.
- **Smart Contracts:** Written in Solidity, deployed via Foundry scripts.

---

## 🏗️ Architecture

### Frontend
- **Next.js App**: Provides a swap interface, token minting, and swap history.
- **Custom Hooks**: For contract reads/writes and EIP-2612 permit signing.
- **No ETH Required**: Users interact without holding ETH.

### Backend
- **Node.js/Express Relayer**: Receives signed permit and swap requests, submits them to the SwapContract on-chain, and logs swap history.
- **Ethers.js**: For contract interaction and transaction signing.

### Smart Contracts
- **SwapContract.sol**: Handles swaps, fees, and gasless permit logic.
- **BuildguidlToken.sol & SuperToken.sol**: ERC-20 tokens with EIP-2612 permit and open minting.

---

## 📄 Smart Contracts

- `SwapContract.sol`: Swaps BGT ↔ SPT at 1:1 minus a 2% fee, using EIP-2612 gasless approvals. Only the contract owner can withdraw tokens. Emits events for debugging and tracking.
- `BuildguidlToken.sol` & `SuperToken.sol`: ERC-20 tokens with EIP-2612 permit, open minting (with per-tx and total supply caps).
- `IERC20Permit.sol`: Interface for ERC-20 tokens supporting EIP-2612 permit.

---

## ⚙️ Requirements

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

---

## 🏁 Quickstart

1. **Install dependencies:**
   ```sh
   yarn install
   ```
2. **Run a local network:**
   ```sh
   yarn chain
   ```
   Starts a local Ethereum network using Foundry. Customize in `packages/foundry/foundry.toml`.
3. **Deploy contracts:**
   ```sh
   yarn deploy
   ```
   Deploys all contracts (tokens and swap contract) to the local network.
4. **Start the frontend:**
   ```sh
   yarn start
   ```
   Visit your app at `http://localhost:3000`.
5. **Run smart contract tests:**
   ```sh
   yarn foundry:test
   ```

- Edit smart contracts in `packages/foundry/contracts`
- Edit frontend homepage at `packages/nextjs/app/page.tsx`
- Edit deployment scripts in `packages/foundry/script`

---

## 🔬 How Gasless Swaps Work

1. **Mint Tokens:** Users mint BGT or SPT to their wallet (with per-tx and total supply caps).
2. **Sign Permit:** When swapping, users sign an EIP-2612 permit message (off-chain, no gas).
3. **Swap:** The backend relayer submits the swap transaction using the permit, paying the gas.
4. **Receive Tokens:** Users receive the output token minus the 2% fee.
5. **View History:** Users can view their recent swaps in the UI.

### EIP-2612 Permit
- Enables gasless token approvals via off-chain signatures.
- The relayer submits the signed permit and swap in a single transaction.

### Relayer
- The backend service receives the signed permit and swap request.
- Submits the transaction to the SwapContract, paying the gas.
- Logs the swap in the database for history display.

---

## 🧩 Token Details

- **BuildguidlToken (BGT):**
  - ERC-20 with EIP-2612 permit
  - 1 billion max supply, 10,000 max mint per tx
- **SuperToken (SPT):**
  - ERC-20 with EIP-2612 permit
  - 1 billion max supply, 10,000 max mint per tx

---

## 🛠️ Contributing

We welcome contributions to Gasless Swap!

- Fork the repo and create a feature branch.
- Submit a pull request with a clear description of your changes.
- For major changes, open an issue first to discuss what you'd like to change.

---

## 📚 Further Reading

- [EIP-2612: permit – 712-signed approvals](https://eips.ethereum.org/EIPS/eip-2612)
- [Foundry Book](https://book.getfoundry.sh/)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)

---
