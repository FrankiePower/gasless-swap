//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/SwapContract.sol";
import "./DeployHelpers.s.sol";

contract DeploySwapContract is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        address superTokenAddress = 0x9359c395Ef76af7A17E46b6F559CE0997FEC31E3;
        address buildguidlTokenAddress = 0x341b3060C5dC9BDBbb3E6D1f01b09c1A5B76d22C;
        SwapContract swapContract = new SwapContract(superTokenAddress, buildguidlTokenAddress);
        deployments.push(Deployment("SwapContract", address(swapContract)));
        console.logString(string.concat("SwapContract deployed at: ", vm.toString(address(swapContract))));
    }
}
