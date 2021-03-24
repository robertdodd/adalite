import {Store, State} from '../state'

export default ({setState}: Store) => {
  return {
    // TODO: remove "optionalArgsObj", as "loadingAction" should not be responsible for setting
    // unrelated parts of the state
    loadingAction: (state: State, message: string, optionalArgsObj?: any) => {
      return setState(
        Object.assign(
          {},
          {
            loading: true,
            loadingMessage: message,
          },
          optionalArgsObj
        )
      )
    },
    stopLoadingAction: (state: State, optionalArgsObj) => {
      return setState(
        Object.assign(
          {},
          {
            loading: false,
            loadingMessage: undefined,
          },
          optionalArgsObj
        )
      )
    },
  }
}
