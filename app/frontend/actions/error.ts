import debugLog from '../helpers/debugLog'
import captureBySentry from '../helpers/captureBySentry'
import {Store, State} from '../state'

export default ({setState}: Store) => {
  return {
    // TODO: remove "options", as "setError" should not be responsible for setting other
    // parts of the state
    setError: (
      state: State,
      {errorName, error, options}: {errorName: string; error: any; options?: any}
    ) => {
      if (error && error.name) {
        debugLog(error)
        captureBySentry(error)
        setState({
          [errorName]: {
            code: error.name,
            params: {
              message: error.message,
            },
          },
          error,
          ...options,
        })
      } else {
        setState({
          [errorName]: error,
          ...options,
        })
      }
    },
  }
}
