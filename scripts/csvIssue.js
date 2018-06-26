/* eslint-disable no-undef */

'use strict'

const fs = require('fs')
const csv = require('fast-csv')
const Web3 = require('web3')

// Configuration here
const BITX_DISTRIBUTION_TOOLS_ADDRESS = '0x5b78fd6f5e8ea497534dd205e58daa51d26eded2'
const BATCH_SIZE = 100

// Use the latest version of web3 with the current provider provided by Truffle
web3 = new Web3(web3.currentProvider)

// Get BITXDistributionTools contract and set to web3 provider
const BITXDistributionTools = artifacts.require('./BITXDistributionTools.sol')
BITXDistributionTools.setProvider(web3.currentProvider)

const distribData = []
let addresses = []
let amounts = []

function main (cb) {
  const stream = fs.createReadStream('scripts/data/contributors.csv')
  let index = 0
  console.log(`
    --------------------------------------------
    --------- Parsing contributors.csv file ---------
    --------------------------------------------
  `)
  const csvStream = csv()
    .on('data', (data) => {
      const isAddress = web3.utils.isAddress(data[0])
      if (isAddress && Number(web3.utils.fromWei(data[1])) > 0) {
        addresses.push(data[0])
        amounts.push(data[1])
        index += 1
        if (index >= BATCH_SIZE) {
          distribData.push([addresses, amounts])
          addresses = []
          amounts = []
          index = 0
        }
      }
    })
    .on('end', () => {
      // Add last remainder batch
      if (addresses.length > 0) {
        distribData.push([addresses, amounts])
        addresses = []
        amounts = []
      }
      distribute(cb)
    })
  stream.pipe(csvStream)
}


async function distribute (cb) {
  console.log(`
    --------------------------------------------
    ---------Performing allocations ------------
    --------------------------------------------
  `)
  const accounts = await web3.eth.getAccounts()
  const nonce = await web3.eth.getTransactionCount(accounts[0])
  const bitxDistributionTools = await BITXDistributionTools.at(BITX_DISTRIBUTION_TOOLS_ADDRESS)

  for (let i = 0; i < distribData.length; i += 1) {
    try {
      console.log('Attempting to issue BITX for accounts:', distribData[i][0], '\n\n')
      bitxDistributionTools.issueToMany(distribData[i][0], distribData[i][1], {
        from: accounts[0].toLowerCase(),
        gas: 4500000,
        gasPrice: Number(web3.utils.toWei(String(2), 'gwei')),
        nonce: nonce + i
      })
      console.log('---------- ---------- ---------- ----------')
    } catch (err) {
      console.log('ERROR:', err)
    }
  }
  cb()
}

module.exports = main
