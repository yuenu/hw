import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type Message {
    id: ID
    sender: String
    body: String
    receiver: String
  }

  input MessageInput {
    sender: String
    body: String
    receiver: String
  }

  type Query {
    messages: [Message!]
  }
  type Mutation {
    createMessage(messageInput: MessageInput): Message
  }
  type Subscription {
    messageCreated: Message
  }
`
