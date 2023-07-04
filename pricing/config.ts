import { Address } from '@graphprotocol/graph-ts'
import * as constants from '../common/constants'

export class PriceConfig {
  public v2Router: Address
  public v3Factory: Address
  public v3Quoter: Address
  public joeLens: Address

  constructor(_v2Router: string | null, _v3Factory: string | null, _v3Quoter: string | null, _joeLens: string | null) {
    this.v2Router = _v2Router ? Address.fromString(_v2Router) : constants.NULL.TYPE_ADDRESS
    this.v3Factory = _v3Factory ? Address.fromString(_v3Factory) : constants.NULL.TYPE_ADDRESS
    this.v3Quoter = _v3Quoter ? Address.fromString(_v3Quoter) : constants.NULL.TYPE_ADDRESS
    this.joeLens = _joeLens ? Address.fromString(_joeLens) : constants.NULL.TYPE_ADDRESS
  }

  public updateConfig(
    _v2Router: string | null,
    _v3Factory: string | null,
    _v3Quoter: string | null,
    _joeLens: string | null,
  ): void {
    this.v2Router = _v2Router ? Address.fromString(_v2Router) : constants.NULL.TYPE_ADDRESS
    this.v3Factory = _v3Factory ? Address.fromString(_v3Factory) : constants.NULL.TYPE_ADDRESS
    this.v3Quoter = _v3Quoter ? Address.fromString(_v3Quoter) : constants.NULL.TYPE_ADDRESS
    this.joeLens = _joeLens ? Address.fromString(_joeLens) : constants.NULL.TYPE_ADDRESS
  }
}

export const DefaultConfig = new PriceConfig(
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  null,
)
