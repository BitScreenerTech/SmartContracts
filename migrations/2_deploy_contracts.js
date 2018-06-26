/* eslint-disable no-undef */

'use strict'

const BitScreenerToken = artifacts.require('./BitScreenerToken.sol')
const BITXDistributionTools = artifacts.require('./BITXDistributionTools.sol')

module.exports = function (deployer) {
  return deployer.deploy(BitScreenerToken, ['0x4db84fdbff9ad2eeb00e75d8c0c5e138760e0f1f'])
    .then(() => deployer.deploy(BITXDistributionTools, BitScreenerToken.address))
    .then(() => BitScreenerToken.deployed())
    .then((instance) => instance.setOwners(['0x4db84fdbff9ad2eeb00e75d8c0c5e138760e0f1f', BITXDistributionTools.address]))
    .then(() => {
      console.log(`
        ---------------------------------------------------------------
        ----- BitScreenerToken (BITX) TOKEN SUCCESSFULLY DEPLOYED -----
        ---------------------------------------------------------------
        - Contract address: ${BitScreenerToken.address}
        - Local Time: ${new Date()}
        ---------------------------------------------------------------
      `)
      console.log(`
        ---------------------------------------------------------------
        ---- BITX Distribution Tools CONTRACT SUCCESSFULLY DEPLOYED ---
        ---------------------------------------------------------------
        - Contract address: ${BITXDistributionTools.address}
        - Local Time: ${new Date()}
        ---------------------------------------------------------------
      `)
    })
}
