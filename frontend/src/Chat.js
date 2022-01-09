import React from 'react'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  gql,
  useMutation,
  useQuery,
  split,
  HttpLink,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
})

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/subscriptions',
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

const GET_MESSAGES = gql`
  subscription OnMessages {
    messages {
      id
      content
      user
    }
  }
`

const POST_MESSAGE = gql`
  mutation ($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`

const Messages = () => {
  const { data } = useSubscription(GET_MESSAGES)
  console.log(data)
  if (!data) return null
  return JSON.stringify(data)
  // return <div>Cool</div>
}

const Chat = () => {
  const [postMessage] = useMutation(POST_MESSAGE)

  const onSend = () => {
    postMessage({
      variables: {
        user: 'Jack',
        content: '',
      },
    })
  }
  return (
    <>
      <Messages />
      <button onClick={() => onSend()}>Add</button>
    </>
  )
}

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
)
