/* eslint-disable no-undef */

'use strict'

const fs = require('fs')
const csv = require('fast-csv')
const _ = require('lodash')
const Web3 = require('web3')

// Configuration here
const BITX_TOKEN_ADDRESS = '0xff2b3353c3015e9f1fbf95b9bda23f58aa7ce007'

// Use the latest version of web3 with the current provider provided by Truffle
web3 = new Web3(web3.currentProvider)

// Get BITXDistributionTools contract and set to web3 provider
const BitScreenerToken = artifacts.require('./BitScreenerToken.sol')
const BITXDistributionTools = artifacts.require('./BITXDistributionTools.sol')
BITXDistributionTools.setProvider(web3.currentProvider)
BitScreenerToken.setProvider(web3.currentProvider)

const contributors = []

function main (cb) {
  const stream = fs.createReadStream('scripts/data/contributors.csv')
  console.log(`
    --------------------------------------------
    --------- Parsing contributors.csv file ---------
    --------------------------------------------
  `)
  const csvStream = csv()
    .on('data', (data) => {
      const isAddress = web3.utils.isAddress(data[0])
      if (isAddress && Number(web3.utils.fromWei(data[1])) > 0) {
        contributors.push({ address: data[0], amount: data[1] })
      }
    })
    .on('end', () => {
      reviewInssuance(cb)
    })
  stream.pipe(csvStream)
}

async function reviewInssuance (cb) {
  // Clear addressNeedToReview.csv file
  fs.truncateSync('scripts/data/addressNeedToReview.csv')

  // Load token and get all Issue event
  const bitxToken = await BitScreenerToken.at(BITX_TOKEN_ADDRESS)
  const events = await bitxToken.Issue({}, { fromBlock: 0, toBlock: 'latest' })
  events.get((error, events) => {
    if (error) {
      console.error(error)
    } else {
      const issuedAddresses = []
      for (let i = 0; i < events.length; i += 1) {
        const amount = web3.utils.toWei(String(events[i].args._value.times(10 ** -18)))
        const address = web3.utils.toChecksumAddress(events[i].args._to)
        issuedAddresses.push({ address, amount })
      }
      const addessesToRevise = _.differenceWith(contributors, issuedAddresses, _.isEqual)
      _.each(addessesToRevise, (a) => fs.appendFileSync('scripts/data/addressNeedToReview.csv', `${a.address},${a.amount}\n`))
    }
    cb()
  })
}

module.exports = main
