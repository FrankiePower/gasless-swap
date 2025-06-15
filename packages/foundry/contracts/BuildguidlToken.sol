// SPDX-License-Identifier: MIT
pragma solidity >=0.8.30;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BuildguidlToken is ERC20Permit {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) ERC20Permit(name) {
        _mint(msg.sender, initialSupply);
    }

     // Minting is open to anyone and for free.
    // You can implement your custom logic to mint tokens.

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}