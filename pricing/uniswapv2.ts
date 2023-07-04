import { BigDecimal, Address, BigInt, log } from '@graphprotocol/graph-ts'
import { UniswapV2Router } from '../generated/abis/UniswapV2Router'
import { ERC20 } from '../common/utils'
import { convertTokenToDecimal, exponentToBigInt } from '../common/number'
import { DefaultConfig } from './config'
import * as constants from '../common/constants'

export namespace UniswapV2 {
  export function getCustomTokenPrice(routerAddress: Address, tokenPath: Address[]): BigDecimal {
    const routerContract = UniswapV2Router.bind(routerAddress)

    const fromTokenDecimal = ERC20.decimal(tokenPath[0])
    const toTokenDecimal = ERC20.decimal(tokenPath[tokenPath.length - 1])

    const amountIn = exponentToBigInt(BigInt.fromI32(<i32>fromTokenDecimal))
    const quote = routerContract.try_getAmountsOut(amountIn, tokenPath)

    if (quote.reverted) {
      log.error('UniswapV2.getCustomTokenPrice: Quote reverted: {} ', [tokenPath[0].toHexString()])
      return constants.ZERO_BD
    } else {
      return convertTokenToDecimal(quote.value[quote.value.length - 1], <i32>toTokenDecimal)
    }
  }

  export function getTokenPrice(tokenPath: Address[]): BigDecimal {
    const routerAddress = DefaultConfig.v2Router

    if (routerAddress && routerAddress != constants.NULL.TYPE_ADDRESS) {
      return getCustomTokenPrice(routerAddress, tokenPath)
    } else {
      log.error('UniswapV2.getTokenPrice: Router address not found in config.', [])
      return constants.ZERO_BD
    }
  }
}
