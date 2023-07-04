import { Address, BigDecimal } from '@graphprotocol/graph-ts'
import { ChainlinkOracle } from '../generated/abis/ChainlinkOracle'
import { convertTokenToDecimal } from '../common/number'
import * as constants from '../common/constants'

export namespace Chainlink {
  export function getLastestPrice(oracleAddress: string): BigDecimal {
    let contract = ChainlinkOracle.bind(Address.fromString(oracleAddress))
    let answer = contract.try_latestAnswer()
    let decimals = contract.try_decimals()

    // Supports better error handling
    // Uses the old price in case of error
    return !answer.reverted && !decimals.reverted
      ? convertTokenToDecimal(answer.value, decimals.value)
      : constants.ZERO_BD
  }
}
