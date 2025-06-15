//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeploySE2Token } from "./DeploySE2Token.s.sol";
import { DeployBuildguidlToken } from "./DeployBuildguidlToken.s.sol";
import { DeploySuperToken } from "./DeploySuperToken.s.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed

        DeploySE2Token deploySE2Token = new DeploySE2Token();
        deploySE2Token.run();

        // Deploy another contract
        // DeployMyContract myContract = new DeployMyContract();
        // myContract.run();
        DeployBuildguidlToken deployBuildguidlToken = new DeployBuildguidlToken();
        deployBuildguidlToken.run();

        DeploySuperToken deploySuperToken = new DeploySuperToken();
        deploySuperToken.run();
    }
}
