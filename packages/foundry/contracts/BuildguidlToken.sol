// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title BuildguildToken
/// @notice An ERC-20 token with a fixed maximum supply and open minting with a per-transaction cap.

contract BuildguidlToken is ERC20Permit {
    /// @notice Maximum total supply of tokens (1 billion tokens with decimals).
    uint256 public immutable MAX_SUPPLY;

    /// @notice Constructs the token with a name and symbol.
    /// @param name The name of the token.
    /// @param symbol The symbol of the token.
    constructor(string memory name, string memory symbol) ERC20(name, symbol) ERC20Permit(name) {
        MAX_SUPPLY = 1000000000;
    }

    /// @notice Mints `amount` tokens to the `to` address, respecting caps.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    /// @dev Anyone can call this function, but each mint is capped at 10,000 tokens.
    function mint(address to, uint256 amount) external {
        require(amount < 10000, "Max mint exceeded");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
