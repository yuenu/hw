import Message from './models/message.js'
import { PubSub, withFilter } from 'graphql-subscriptions'

const pubsub = new PubSub()
const INIT_MESSAGE = 'INIT_MESSAGE'
const MESSAGE_CREATEED = 'MESSAGE_CREATEED'
const TOGGLE_STATUS = 'TOGGLE_STATUS'
const FETCH_MESSAGES = 'FETCH_MESSAGES'

export const resolvers = {
  Query: {
    messages: async () => {
      return await Message.find()
    },
    getTabMessages: async (_, { input: { user, peopleTo } }) => {
      const messages = await Message.find({
        $or: [
          {
            $and: [{ sender: user }, { receiver: peopleTo }],
          },
          {
            $and: [{ sender: peopleTo }, { receiver: user }],
          },
        ],
      })
      pubsub.publish(FETCH_MESSAGES)
      return messages
    },
  },
  Mutation: {
    initMessage: async () => {
      const messages = await Message.find()
      pubsub.publish(INIT_MESSAGE, {
        allMessages: messages,
      })
      return messages
    },
    createMessage: async (
      _parent,
      { messageInput: { sender, body, receiver } }
    ) => {
      const newMessage = new Message({ sender, body, receiver })
      const res = await newMessage.save()
      console.log('message saved')

      pubsub.publish(MESSAGE_CREATEED, {
        messageCreated: {
          id: res.id,
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
    clearMessages: async () => {
      Message.deleteMany({}, () => {
        return true
      })
    },
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(MESSAGE_CREATEED),
    },
  },
}
