// import Message from './models/message'
import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()

const messages = []
const subscribers = []
const onMessagesUpdates = (fn) => subscribers.push(fn)

export const resolvers = {
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
      subscribe: (parent, args) => {
        const channel = Math.random().toString(36).slice(2, 15)
        onMessagesUpdates(() => pubsub.publish(channel, { messages }))
        setTimeout(() => pubsub.publish(channel, { messages }), 0)
        return pubsub.asyncIterator(channel)
      },
    },
  },
}
