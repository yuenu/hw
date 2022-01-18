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
import { PubSub } from 'graphql-subscriptions'
import path from 'path'
const app = express()
const pubsub = new PubSub()

dotenv.config()

app.use(express.static(path.join(__dirname, 'frontend/build')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/frontend/build/index.html'))
})

const LunchServer = async () => {
  const httpServer = createServer(app)
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect(connectionParams, webSocket, context) {
        return console.log('webSocket Connected!')
      },
      onDisconnect(webSocket, context) {
        console.log('webSocket Disconnected!')
      },
    },
    { server: httpServer, path: '/subscriptions' }
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

  if (!process.env.MONGO_URL) {
    console.error('Missing MONGO_URL!!!')
    process.exit(1)
  }

  const db = mongoose.connection
  db.once('open', () => {
    console.log('MongoDB conntected!!')
  })

  mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  const PORT = 5000
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}/graphql`)
  )
}

LunchServer()
