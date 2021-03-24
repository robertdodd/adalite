import {Store, State} from '../state'

export default ({setState}: Store) => {
  return {
    loadingAction: (state: State, message: string) => {
      return setState({
        loading: true,
        loadingMessage: message,
      })
    },
    stopLoadingAction: (state: State) => {
      return setState({
        loading: false,
        loadingMessage: undefined,
      })
    },
  }
}
