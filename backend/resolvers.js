import Message from './models/message'
import { PubSub, withFilter } from 'graphql-subscriptions'

const pubsub = new PubSub()
const INIT_MESSAGE = 'init_message'

// const messages = []
// const subscribers = []
// const onMessagesUpdates = (fn) => subscribers.push(fn)

export const resolvers = {
  Query: {
    // messages: () => messages,
    getDbMessages: async () => {
      return await Message.find()
    },
  },
  Mutation: {
    // postMessage: (parent, { user, content }) => {
    //   const id = messages.length
    //   messages.push({
    //     id,
    //     user,
    //     content,
    //   })
    //   subscribers.forEach((fn) => fn())
    //   return id
    // },
    createMessage: async (parent, { sender, body, receiver }) => {
      const newMessage = new Message({ sender, body, receiver })
      const res = await newMessage.save()
      console.log('message saved', res)

      pubsub.publish('MESSAGE_CREATEED', {
        messageCreated: {
          sender,
          body,
          receiver,
        },
      })

      return {
        id: res.id,
        ...res._doc,
      }
    },
  },
  Subscription: {
    // messages: {
    //   subscribe: (parent, args) => {
    //     const channel = Math.random().toString(36).slice(2, 15)
    //     onMessagesUpdates(() => pubsub.publish(channel, { messages }))
    //     setTimeout(() => pubsub.publish(channel, { messages }), 0)
    //     return pubsub.asyncIterator(channel)
    //   },
    // },
    messageCreated: {
      subscribe: () => pubsub.asyncIterator('MESSAGE_CREATEED'),
    },
  },
}
