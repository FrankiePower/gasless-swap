// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "./IERC20Permit.sol";

contract SwapContract {
    IERC20Permit public immutable superToken;
    IERC20Permit public immutable buildguidlToken;
    address public immutable owner;

    constructor(address superTokenAddress, address buildguidlTokenAddress) {
        superToken = IERC20Permit(superTokenAddress);
        buildguidlToken = IERC20Permit(buildguidlTokenAddress);
        owner = msg.sender;
    }

    error GaslessSwap__TransferFailed();
    error GaslessSwap__PermitFailed();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function swap(
        bool isSuperToBuild, // true: superToken→buildguidlToken, false: reverse
        address _from,
        uint256 _amountIn,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s,
        address _to,
        uint256 _fee
    ) external onlyOwner {
        IERC20Permit tokenIn = isSuperToBuild ? superToken : buildguidlToken;
        IERC20Permit tokenOut = isSuperToBuild ? buildguidlToken : superToken;
        uint256 _totalCharge = _amountIn + _fee;

        // Gasless approval for tokenIn
        try tokenIn.permit(_from, address(this), _totalCharge, _deadline, _v, _r, _s) { }
        catch {
            revert GaslessSwap__PermitFailed();
        }

        // Take tokenIn from user
        bool success1 = tokenIn.transferFrom(_from, address(this), _totalCharge);
        if (!success1) revert GaslessSwap__TransferFailed();

        // Send tokenOut to recipient (1:1 ratio example)
        bool success2 = tokenOut.transfer(_to, _amountIn);
        if (!success2) revert GaslessSwap__TransferFailed();

        // Send fee in tokenOut to owner
        if (_fee > 0) {
            bool success3 = tokenOut.transfer(owner, _fee);
            if (!success3) revert GaslessSwap__TransferFailed();
        }
    }
}
