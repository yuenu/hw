import express from 'express'
import cors from 'cors'
import { createServer, createPubSub } from 'graphql-yoga'

const app = express()
app.use(cors())
const messages = []

const typeDefs = `
  type Message {
    id: ID!
    user: String!
    content: String!
  }
  type Query {
    messages: [Message!]
  }
  type Mutation {
    postMessage(user: String!, content: String!): ID!
  }
  type Subscription {
    messages: [Message!]
  }
`

const subscribers = []
const onMessagesUpdates = (fn) => subscribers.push(fn)

const resolvers = {
  Query: {
    messages: () => messages,
  },
  Mutation: {
    postMessage: (parent, { user, content }) => {
      const id = messages.length
      messages.push({
        id,
        user,
        content,
      })
      subscribers.forEach((fn) => fn())
      return id
    },
  },
  Subscription: {
    messages: {
      subscribe: (parent, args, { pubsub }) => {
        const channel = Math.random().toString(36).slice(2, 15)
        onMessagesUpdates(() => pubsub.publish(channel, { messages }))
        setTimeout(() => pubsub.publish(channel, { messages }), 0)
        return pubsub.asyncIterator(channel)
      },
    },
  },
}

const graphQLServer = createServer({
  typeDefs,
  resolvers,
  subscriptions: '/subscriptions',
})

// Bind GraphQL Yoga to `/graphql` endpoint
// Here it takes the request and response objects and handles them internally
app.use('/graphql', graphQLServer.requestListener)

app.listen(4000, () => {
  console.log('Running a GraphQL API server at http://localhost:4000/graphql')
})
