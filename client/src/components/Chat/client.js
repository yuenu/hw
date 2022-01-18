import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

const websocketLink = process.env.NODE_ENV === 'development' ? `ws://localhost:${process.env.REACT_APP_PORT || 5000}/subscriptions` : `wss://localhost:${process.env.REACT_APP_PORT || 5000}/subscriptions`

console.log(process.env.NODE_ENV)
const httpLink = new HttpLink({
  uri: `http://localhost:${process.env.REACT_APP_PORT || 5000}/graphql`,
})

const wsLink = new WebSocketLink({
  uri: websocketLink,
  options: {
    reconnect: true,
  },
})

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

export default client
