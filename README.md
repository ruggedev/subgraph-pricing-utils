# subgrpah-pricing-utils

Simple `npm` pkg to get token price from different price source on TheGraph.

### 1. Install

```
$ npm install @ruggedhaha/subgraph-pricing-utils --save-dev
or
$ yarn add @ruggedhaha/subgraph-pricing-utils -D
```

### 2. Update `abis` inside your `subgraph.yaml`

```
abis:
    - name: ChainlinkOracle
      file: ../abis/ChainlinkOracle.json
    - name: ERC20
      file: ../abis/ERC20.json
    - name: JoeDexLens
      file: ../abis/JoeDexLens.json
    - name: Quoter
      file: ../abis/Quoter.json
    - name: UniswapV2Factory
      file: ../abis/UniswapV2Factory.json
    - name: UniswapV2Pair
      file: ../abis/UniswapV2Pair.json
    - name: UniswapV2Router
      file: ../abis/UniswapV2Router.json
    - name: UniswapV3Factory
      file: ../abis/UniswapV3Factory.json
    - name: UniswapV3Pool
      file: ../abis/UniswapV3Pool.json
```

### 3. (Optional) Update the default config

```javascript
const config = DefaultConfig
config.updateConfig(
   <UNIV2_ROUTER>,
   <UNIV3_FACTORY>,
   <UNIV3_QUOTER>,
   <JOE_LENS>
)
```

### 4. Get the token price

```javascript
import { Chainlink, UniswapV2, UniswapV3, DefaultConfig } from '@ruggedhaha/subgraph-pricing-utils'
// Default router set to UniswapV2
const wethPrice = UniswapV2.getTokenPrice([
  Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
  Address.fromString('0xdac17f958d2ee523a2206206994597c13d831ec7'),
])
// Custom price from any UniswapV2-like AMM
const wethPrice_sushi =UniswapV2.getCustomTokenPrice(Address.fromString('0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F') , // Sushi
    [
        Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
        Address.fromString('0xdac17f958d2ee523a2206206994597c13d831ec7'),
    ]),
```
