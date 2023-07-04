import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { Quoter } from '../generated/abis/Quoter'
import { UniswapV3Factory } from '../generated/abis/UniswapV3Factory'
import { UniswapV3Pool } from '../generated/abis/UniswapV3Pool'
import * as constants from '../common/constants'
import { DefaultConfig } from './config'
import { ERC20 } from '../common/utils'
import { convertTokenToDecimal, exponentToBigInt } from '../common/number'

export namespace UniswapV3 {
  export function getPoolFee(poolAddress: Address): number {
    let poolContract = UniswapV3Pool.bind(poolAddress)

    return !poolContract.try_fee().reverted ? poolContract.try_fee().value : 0
  }

  export function getPairFeeTier(token0: Address, token1: Address): number {
    if (
      token0 === constants.NULL.TYPE_ADDRESS ||
      token1 === constants.NULL.TYPE_ADDRESS ||
      token0.toHexString() === '' ||
      token1.toHexString() === ''
    ) {
      log.error('UniswapV3.getPairFeeTier: Invalid token addresses. token0: {} token1: {}', [
        token0.toHexString(),
        token1.toHexString(),
      ])
      return -1
    }

    const v3Factory = DefaultConfig.v3Factory
    if (v3Factory == constants.NULL.TYPE_ADDRESS || !v3Factory) {
      log.error('UniswapV3.getFeeFromPair: factoryAddress not found.', [])
      return -1
    }

    const dataPoints = [100, 500, 3000, 10000]
    let pools: string[] = []
    const contract = UniswapV3Factory.bind(v3Factory)

    // get all pool address by brute force
    for (let i = 0; i < dataPoints.length; ++i) {
      let poolCall = contract.try_getPool(token0, token1, dataPoints[i])
      if (!poolCall.reverted) {
        if (poolCall.value.toHexString() != constants.NULL.TYPE_STRING) {
          pools.push(poolCall.value.toHexString())
        }
      } else {
        continue
      }
    }

    let maxLiquidity = BigInt.fromI32(0)
    let largestPool = ''
    // return the pool with most liquidity as pricefeed
    if (pools.length == 0 || pools[0] === '') {
      log.error('UniswapV3.getFeeFromPair: pool not found. (1) token0: {} token1: {}', [
        token0.toHexString(),
        token1.toHexString(),
      ])
      return -1
    } else if (pools.length == 1) {
      return getPoolFee(Address.fromString(pools[0]))
    } else {
      for (let j = 0; j < pools.length; ++j) {
        if (pools[j] == '') {
          return -1
        }
        const poolContract = UniswapV3Pool.bind(Address.fromString(pools[j]))

        let reserveCall = poolContract.try_liquidity()
        if (reserveCall.reverted) {
          continue
        } else {
          if (reserveCall.value.gt(maxLiquidity)) {
            maxLiquidity = reserveCall.value
            largestPool = pools[j]
          }
        }
      }
    }

    if (largestPool == '' || largestPool == constants.NULL.TYPE_STRING) {
      log.error('UniswapV3.getPairFeeTier: pool not found.token0: {} token1: {}', [
        token0.toHexString(),
        token1.toHexString(),
      ])
      return -1
    } else {
      const fee = getPoolFee(Address.fromString(largestPool))
      return fee
    }
  }

  export function getAmountOut(
    quoterAddress: Address,
    fromToken: Address,
    toToken: Address,
    amountIn: BigInt,
    fee: number,
  ): BigInt {
    const contract = Quoter.bind(quoterAddress)
    const rawQuote = contract.try_quoteExactInputSingle(fromToken, toToken, <i32>fee, amountIn, constants.ZERO_BI)

    if (rawQuote.reverted) {
      log.error('Uniswap.getAmountOut: Invalid swap quote from {} to {}', [
        fromToken.toHexString(),
        toToken.toHexString(),
      ])
      return constants.ZERO_BI
    } else {
      return rawQuote.value
    }
  }

  export function getPrice(path: Address[]): BigDecimal {
    const config = DefaultConfig

    const quoterAddress = config.v3Quoter
    if (quoterAddress == constants.NULL.TYPE_ADDRESS || !quoterAddress) {
      log.error('UniswapV3.getPrice: Quoter address not found. token : {}', [path[0].toHexString()])
      return constants.ZERO_BD
    }

    const fromTokenDecimal = ERC20.decimal(path[0])
    const toTokenDecimal = ERC20.decimal(path[path.length - 1])

    if (path.length < 2) {
      log.error('UniswapV3.getPriceInUSDWithCustomPath: Invalid swap path. token : {}', [path[0].toHexString()])
      return constants.ZERO_BD
    }

    let amountIn = exponentToBigInt(BigInt.fromI32(<i32>fromTokenDecimal))
    let amountOutBI: BigInt = constants.ZERO_BI

    for (let i = 0; i < path.length - 1; ++i) {
      const fee = getPairFeeTier(path[i], path[i + 1])
      if (fee == -1) {
        log.error('UniswapV3.getPriceInUSDWithCustomPath: Invalid fee tier. token : {}', [path[0].toHexString()])
        return constants.ZERO_BD
      }
      amountOutBI = getAmountOut(quoterAddress, path[i], path[i + 1], amountIn, fee)
      amountIn = amountOutBI
    }

    return convertTokenToDecimal(amountOutBI, <i32>toTokenDecimal)
  }
}
