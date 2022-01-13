import { gql } from '@apollo/client'

export const GET_TAB_MESSAGES = gql`
  query GetTabMessages($user: String, $peopleTo: String) {
    getTabMessages(input: { user: $user, peopleTo: $peopleTo }) {
      id
      sender
      body
      receiver
    }
  }
`

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($sender: String, $body: String, $receiver: String) {
    createMessage(
      messageInput: { sender: $sender, body: $body, receiver: $receiver }
    ) {
      id
      sender
      body
      receiver
    }
  }
`

export const CLEAR_MESSAGES = gql`
  mutation Mutation {
    clearMessages
  }
`

export const MESSAGE_SUB = gql`
  subscription MessageCreated {
    messageCreated {
      id
      sender
      body
      receiver
    }
  }
`
