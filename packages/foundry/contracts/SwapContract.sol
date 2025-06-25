// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IERC20Permit.sol";

contract SwapContract {
    IERC20Permit public immutable superToken;
    IERC20Permit public immutable buildguidlToken;
    address public immutable owner;

    uint256 public constant FEE_PERCENT = 2; // 2% fee
    uint256 public constant FEE_DENOMINATOR = 100;

    constructor(address superTokenAddress, address buildguidlTokenAddress) {
        superToken = IERC20Permit(superTokenAddress);
        buildguidlToken = IERC20Permit(buildguidlTokenAddress);
        owner = msg.sender;
    }

    error GaslessSwap__TransferFailed(string step);
    error GaslessSwap__PermitFailed();
    error GaslessSwap__InsufficientContractBalance();

    event DebugPermit(address indexed token, bool success);
    event DebugTransfer(string step, bool success, uint256 amount);
    event DebugBalance(address indexed token, uint256 balance);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function swap(
        bool isSuperToBuild,
        address _owner,
        uint256 _amountIn,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external onlyOwner {
        IERC20Permit tokenIn = isSuperToBuild ? superToken : buildguidlToken;
        IERC20Permit tokenOut = isSuperToBuild ? buildguidlToken : superToken;

        // Calculate output amount (1:1 ratio minus 2% fee)
        uint256 feeAmount = (_amountIn * FEE_PERCENT) / FEE_DENOMINATOR;
        uint256 amountOut = _amountIn - feeAmount;

        // Check contract balance
        if (tokenOut.balanceOf(address(this)) < amountOut) {
            revert GaslessSwap__InsufficientContractBalance();
        }

        // Gasless approval for full amount
        try tokenIn.permit(_owner, address(this), _amountIn, _deadline, _v, _r, _s) {
            
        } catch {
            
            revert GaslessSwap__PermitFailed();
        }

        // Take tokenIn
        bool success1 = tokenIn.transferFrom(_owner, address(this), _amountIn);
        emit DebugTransfer("transferFrom", success1, _amountIn);
        if (!success1) revert GaslessSwap__TransferFailed("transferFrom");

        // Send tokenOut
        bool success2 = tokenOut.transfer(_owner, amountOut);
        emit DebugTransfer("transferToRecipient", success2, amountOut);
        if (!success2) revert GaslessSwap__TransferFailed("transferToRecipient");

    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20Permit(token).transfer(owner, amount);
    }

    function getSuperTokenBalance() external view returns (uint256) {
        return superToken.balanceOf(address(this));
    }

    function getBuildguidlTokenBalance() external view returns (uint256) {
        return buildguidlToken.balanceOf(address(this));
    }
}