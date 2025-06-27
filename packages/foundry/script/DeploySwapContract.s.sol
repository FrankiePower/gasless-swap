//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/SwapContract.sol";
import "./DeployHelpers.s.sol";

contract DeploySwapContract is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        address superTokenAddress = 0x9a7d82ADc5df5B2E516c432db1EcAFE5Aaf069a3;
        address buildguidlTokenAddress = 0x8c56bcb0aA14f67d653340652Bd9C9273298FdB3;
        SwapContract swapContract = new SwapContract(superTokenAddress, buildguidlTokenAddress);
        deployments.push(Deployment("SwapContract", address(swapContract)));
        console.logString(string.concat("SwapContract deployed at: ", vm.toString(address(swapContract))));
    }
}
