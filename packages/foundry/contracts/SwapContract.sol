// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IERC20Permit.sol";

/// @title SwapContract
/// @notice Swaps SuperToken ↔ BuildguidlToken at 1:1 minus a 2% fee, using EIP-2612 gasless approvals.
contract SwapContract {
    IERC20Permit public immutable superToken;
    IERC20Permit public immutable buildguidlToken;
    address public immutable owner;

    uint256 public constant FEE_PERCENT = 2; // 2%
    uint256 public constant FEE_DENOMINATOR = 100;

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

    constructor(address superTokenAddress, address buildguidlTokenAddress) {
        require(superTokenAddress != address(0), "Invalid SuperToken address");
        require(buildguidlTokenAddress != address(0), "Invalid BuildguidlToken address");

        superToken = IERC20Permit(superTokenAddress);
        buildguidlToken = IERC20Permit(buildguidlTokenAddress);
        owner = msg.sender;
    }

    /// @notice Executes a gasless token swap using permit and transferFrom.
    /// @param isSuperToBuild Direction of the swap.
    /// @param _owner Address performing the swap.
    /// @param _amountIn Input token amount (in wei).
    /// @param _deadline Deadline for permit validity.
    /// @param _v,_r,_s Components of the EIP-2612 signature.
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

        // Calculate output amount (2% fee)
        uint256 feeAmount = (_amountIn * FEE_PERCENT) / FEE_DENOMINATOR;
        uint256 amountOut = _amountIn - feeAmount;

        // Check contract balance of output token
        uint256 availableOut = tokenOut.balanceOf(address(this));
        emit DebugBalance(address(tokenOut), availableOut);

        if (availableOut < amountOut) {
            revert GaslessSwap__InsufficientContractBalance();
        }

        // Call permit (gasless approval)
        try tokenIn.permit(_owner, address(this), _amountIn, _deadline, _v, _r, _s) {
            emit DebugPermit(address(tokenIn), true);
        } catch {
            emit DebugPermit(address(tokenIn), false);
            revert GaslessSwap__PermitFailed();
        }

        // Pull tokens from owner
        bool successIn = tokenIn.transferFrom(_owner, address(this), _amountIn);
        emit DebugTransfer("transferFrom", successIn, _amountIn);
        if (!successIn) revert GaslessSwap__TransferFailed("transferFrom");

        // Send tokens to recipient
        bool successOut = tokenOut.transfer(_owner, amountOut);
        emit DebugTransfer("transferToRecipient", successOut, amountOut);
        if (!successOut) revert GaslessSwap__TransferFailed("transferToRecipient");
    }

    /// @notice Owner can withdraw any ERC-20 token from contract.
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        bool success = IERC20Permit(token).transfer(owner, amount);
        require(success, "Withdraw failed");
    }

    function getSuperTokenBalance() external view returns (uint256) {
        return superToken.balanceOf(address(this));
    }

    function getBuildguidlTokenBalance() external view returns (uint256) {
        return buildguidlToken.balanceOf(address(this));
    }
}
