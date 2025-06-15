//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/BuildguidlToken.sol";
import "./DeployHelpers.s.sol";

contract DeployBuildguidlToken is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        BuildguidlToken buildguidlToken = new BuildguidlToken("BuildguidlToken", "BGT", 1000000000);
        console.logString(string.concat("BuildguidlToken deployed at: ", vm.toString(address(buildguidlToken))));
    }
}