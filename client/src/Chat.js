// import './App.css'
// import { useState, useEffect, useRef, useCallback } from 'react'
// import { Button, Input, Tabs } from 'antd'
// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloProvider,
//   gql,
//   useMutation,
//   split,
//   HttpLink,
//   useLazyQuery,
// } from '@apollo/client'
// import { getMainDefinition } from '@apollo/client/utilities'
// import { WebSocketLink } from '@apollo/client/link/ws'

// const { TabPane } = Tabs

// const httpLink = new HttpLink({
//   uri: 'http://localhost:4000/graphql',
// })

// const wsLink = new WebSocketLink({
//   uri: 'ws://localhost:4000/subscriptions',
//   options: {
//     reconnect: true,
//   },
// })

// // The split function takes three parameters:
// //
// // * A function that's called for each operation to execute
// // * The Link to use for an operation if the function returns a "truthy" value
// // * The Link to use for an operation if the function returns a "falsy" value
// const splitLink = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query)
//     return (
//       definition.kind === 'OperationDefinition' &&
//       definition.operation === 'subscription'
//     )
//   },
//   wsLink,
//   httpLink
// )

// const client = new ApolloClient({
//   link: splitLink,
//   cache: new InMemoryCache(),
// })

// const GET_TAB_MESSAGES = gql`
//   query GetTabMessages($user: String, $peopleTo: String) {
//     getTabMessages(input: { user: $user, peopleTo: $peopleTo }) {
//       id
//       sender
//       body
//       receiver
//     }
//   }
// `

// const CREATE_MESSAGE = gql`
//   mutation CreateMessage($sender: String, $body: String, $receiver: String) {
//     createMessage(
//       messageInput: { sender: $sender, body: $body, receiver: $receiver }
//     ) {
//       id
//       sender
//       body
//       receiver
//     }
//   }
// `

// const CLEAR_MESSAGES = gql`
//   mutation Mutation {
//     clearMessages
//   }
// `

// const MESSAGE_SUB = gql`
//   subscription MessageCreated {
//     messageCreated {
//       id
//       sender
//       body
//       receiver
//     }
//   }
// `

// const Header = ({ username, onClear, modalVisible }) => {
//   return (
//     <div className="App-title">
//       <h1>
//         {!modalVisible && username.length > 0
//           ? `${username}'s Chat Room`
//           : 'Simple Chat'}
//       </h1>
//       <Button type="primary" danger onClick={() => onClear()}>
//         Clear
//       </Button>
//     </div>
//   )
// }

// function TabMessages({ user, peopleTo, onTabChange, messageRef }) {
//   const [messages, setMessages] = useState([])
//   const [GetTabMessages, { data, loading, subscribeToMore }] = useLazyQuery(
//     GET_TAB_MESSAGES,
//     {
//       variables: {
//         user: user,
//         peopleTo: peopleTo,
//       },
//     }
//   )

//   const autoScroll = (ref) => {
//     if (ref && ref.current && ref.current.scrollHeight)
//       ref.current.scrollTop = ref.current.scrollHeight
//   }

//   console.log('Render tab messages FC')
//   useEffect(() => {
//     let unsubscribe
//     console.log('toggle apollo-client subscription')
//     if (!unsubscribe) {
//       unsubscribe = subscribeToMore({
//         document: MESSAGE_SUB,
//         updateQuery: (prev, { subscriptionData }) => {
//           if (!subscriptionData) return prev
//           const newMessage = subscriptionData.data.messageCreated
//           const updatedMessageList = Object.assign({}, prev, {
//             getTabMessages: [...prev.getTabMessages, newMessage],
//           })
//           return updatedMessageList
//         },
//       })
//     }

//     if (unsubscribe) return () => unsubscribe()
//   }, [subscribeToMore])

//   useEffect(() => {
//     console.log('data:', data)
//     if (data !== undefined) {
//       setMessages(data.getTabMessages)
//       autoScroll(messageRef)
//     }
//   }, [data, messageRef])

//   if (loading) return <p>Loading...</p>

//   return (
//     <>
//       {!loading && messages.length > 0 ? (
//         data.getTabMessages.map(({ sender, body, id }) => {
//           return (
//             <div className="App-message" key={id}>
//               <div
//                 className="message"
//                 style={{
//                   flexDirection: sender === user ? 'row-reverse' : 'row',
//                 }}
//               >
//                 <span className="message-name">{sender}</span>
//                 <span className="message-text">{body}</span>
//               </div>
//             </div>
//           )
//         })
//       ) : (
//         <p style={{ color: '#ccc' }}>No messages...</p>
//       )}
//     </>
//   )
// }

// function Chat() {

// // eslint-disable-next-line import/no-anonymous-default-export
// export default () => (
//   <ApolloProvider client={client}>
//     <Chat />
//   </ApolloProvider>
// )
