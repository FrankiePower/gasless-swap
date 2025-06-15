//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/SuperToken.sol";
import "./DeployHelpers.s.sol";

contract DeploySuperToken is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        SuperToken superToken = new SuperToken("SuperToken", "SPT", 1000000000);
        console.logString(string.concat("SuperToken deployed at: ", vm.toString(address(superToken))));
    }
}