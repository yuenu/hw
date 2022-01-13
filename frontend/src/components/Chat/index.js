import { ApolloProvider } from '@apollo/client'
import client from './client'
import Container from './Container'

const Chat = () => {
  return (
    <ApolloProvider client={client}>
      <Container />
    </ApolloProvider>
  )
}

export default Chat
