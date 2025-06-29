// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title BuildguildToken
/// @notice An ERC-20 token with a fixed maximum supply and open minting with a per-transaction cap.
contract BuildguidlToken is ERC20Permit {
    /// @notice Maximum total supply of tokens (1 billion tokens with decimals).
    uint256 public immutable MAX_SUPPLY;

    /// @notice Per-transaction mint cap (10,000 tokens with decimals).
    uint256 public constant MAX_MINT_PER_TX = 10_000 * 10 ** 18;

    /// @notice Constructs the token with a name and symbol.
    /// @param name The name of the token.
    /// @param symbol The symbol of the token.
    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        MAX_SUPPLY = 1_000_000_000 * 10 ** decimals(); // Use decimals-aware max supply
    }

    /// @notice Mints `amount` tokens to the `to` address, respecting caps.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint (in full-token units, i.e., 10 * 10^18 = 10 tokens).
    function mint(address to, uint256 amount) external {
        require(amount <= MAX_MINT_PER_TX, "Max mint per tx exceeded");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
