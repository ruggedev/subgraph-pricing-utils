import { Address, BigDecimal, log } from '@graphprotocol/graph-ts'
import { JoeDexLens } from '../generated/abis/JoeDexLens'
import { convertTokenToDecimal } from '../common/number'
import * as constants from '../common/constants'
import { DefaultConfig } from './config'

export namespace TraderJoe {
  export function getPrice(tokenAddress: Address): BigDecimal {
    let lens = JoeDexLens.bind(DefaultConfig.joeLens)
    const lensCall = lens.try_getTokenPriceUSD(tokenAddress)

    if (lensCall.reverted) {
      log.warning('TraderJoe: getPrice reverted :{}', [tokenAddress.toHexString()])
      return constants.ZERO_BD
    }

    return convertTokenToDecimal(lensCall.value, 6)
  }
}
