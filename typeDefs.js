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

  input TabMessages {
    user: String
    peopleTo: String
  }

  input Status {
    type: String
    content: String
  }

  type Query {
    messages: [Message!]
    getTabMessages(input: TabMessages): [Message]
  }
  type Mutation {
    initMessage: [Message!]
    createMessage(messageInput: MessageInput): Message
    clearMessages: Boolean
  }
  type Subscription {
    messageCreated: Message
    allMessages: [Message!]
  }
`
