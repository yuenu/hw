import { createServer } from 'http'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { makeExecutableSchema } from '@graphql-tools/schema'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { resolvers } from './resolvers'
import { typeDefs } from './typeDefs'
import dotenv from 'dotenv-defaults'
import mongoose from 'mongoose'

dotenv.config()

if (!process.env.MONGO_URL) {
  console.error('Missing MONGO_URL!!!')
  process.exit(1)
}

const LunchServer = async () => {
  const app = express()

  const httpServer = createServer(app)

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const db = mongoose.connection

  db.once('open', () => {
    console.log('MongoDB conntected!!')
  })

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect(connectionParams, webSocket, context) {
        console.log('webSocket Connected!')
      },
      onDisconnect(webSocket, context) {
        console.log('webSocket Disconnected!')
      },
    },
    { server: httpServer, path: '/graphql' }
  )

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close()
            },
          }
        },
      },
    ],
  })
  await server.start()
  server.applyMiddleware({ app })

  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const PORT = 4000
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}/graphql`)
  )
}

LunchServer()
