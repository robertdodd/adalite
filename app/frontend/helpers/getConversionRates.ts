import {State} from '../state'
import {ConvectionRates} from '../types'
import request from '../wallet/helpers/request'

async function getConversionRates(state: State): Promise<ConvectionRates> {
  let conversionRates = state.conversionRates
  const maxConversionRatesAge = 1000 * 60 * 5

  if (!conversionRates || Date.now() - conversionRates.timestamp > maxConversionRatesAge) {
    conversionRates = {
      timestamp: Date.now(),
      data: await fetchConversionRates(),
    }
  }

  return conversionRates
}

async function fetchConversionRates(): Promise<ConvectionRates['data']> {
  return await request('https://min-api.cryptocompare.com/data/price?fsym=ADA&tsyms=USD,EUR').catch(
    (e) => null
  )
}

export default getConversionRates
