import React from 'react'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useSubscription,
  gql,
  useMutation,
  useQuery,
} from '@apollo/client'
import { split, HttpLink } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
// import { WebSocketLink } from '@apollo/client/link/ws'
// for Apollo Client v3:
import { ApolloLink, Observable } from '@apollo/client/core'

import { print } from 'graphql'
import { createClient } from 'graphql-ws'

import ws from 'ws'

class WebSocketLink extends ApolloLink {
  client

  constructor(options) {
    super()
    this.client = createClient(options)
  }

  request(operation) {
    return new Observable((sink) => {
      return this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: (err) => {
            if (Array.isArray(err))
              // GraphQLError[]
              return sink.error(
                new Error(err.map(({ message }) => message).join(', '))
              )

            if (err instanceof CloseEvent)
              return sink.error(
                new Error(
                  `Socket closed with event ${err.code} ${err.reason || ''}` // reason will be available on clean closes only
                )
              )

            return sink.error(err)
          },
        }
      )
    })
  }
}

const wsLink = () =>
  new WebSocketLink({
    url: 'ws://localhost:4000/graphql',
    webScocketImp: ws,
    options: {
      reconnect: true,
    },
  })

const httpLink = () =>
  new HttpLink({
    uri: 'http://localhost:4000/graphql',
  })

// const wsLink = () =>
//   new WebSocketLink({
//     uri: 'ws://localhost:4000/subscriptions',
//     options: {
//       reconnect: true,
//     },
//   })

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = () =>
  split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink(),
    httpLink()
  )

const client = new ApolloClient({
  link: typeof window === 'undefined' ? httpLink() : splitLink(),
  cache: new InMemoryCache(),
})

const GET_MESSAGES = gql`
  subscription {
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
  const data = useSubscription(GET_MESSAGES)
  if (!data) return null
  console.log(data)
  return JSON.stringify(data)
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
