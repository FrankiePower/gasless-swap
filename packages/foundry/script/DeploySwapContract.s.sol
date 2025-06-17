//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/SwapContract.sol";
import "./DeployHelpers.s.sol";

contract DeploySwapContract is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        address superTokenAddress = 0xe1Aa25618fA0c7A1CFDab5d6B456af611873b629;
        address buildguidlTokenAddress = 0x8ce361602B935680E8DeC218b820ff5056BeB7af;
        SwapContract swapContract = new SwapContract(superTokenAddress, buildguidlTokenAddress);
        deployments.push(Deployment("SwapContract", address(swapContract)));
        console.logString(string.concat("SwapContract deployed at: ", vm.toString(address(swapContract))));
    }
}
