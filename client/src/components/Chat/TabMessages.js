import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { GET_TAB_MESSAGES, MESSAGE_SUB } from './server'

function TabMessages({ user, peopleTo, onTabChange, messageRef }) {
  const [messages, setMessages] = useState([])
  const { data, loading, subscribeToMore } = useQuery(
    GET_TAB_MESSAGES,
    {
      variables: {
        user: user,
        peopleTo: peopleTo,
      },
    }
  )

  const autoScroll = (ref) => {
    if (ref && ref.current && ref.current.scrollHeight)
      ref.current.scrollTop = ref.current.scrollHeight
  }

  useEffect(() => {
    let unsubscribe
    if (!unsubscribe) {
      unsubscribe = subscribeToMore({
        document: MESSAGE_SUB,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData) return prev
          const newMessage = subscriptionData.data.messageCreated
          const updatedMessageList = Object.assign({}, prev, {
            getTabMessages: [...prev.getTabMessages, newMessage],
          })
          return updatedMessageList
        },
      })
    }

    if (unsubscribe) return () => unsubscribe()
  }, [subscribeToMore])

  useEffect(() => {
    if (data !== undefined) {
      setMessages(data.getTabMessages)
      autoScroll(messageRef)
    }
  }, [data, messageRef])

  if (loading) return <p>Loading...</p>

  return (
    <>
      {!loading && messages.length > 0 ? (
        data.getTabMessages.map(({ sender, body, id }) => {
          return (
            <div className="App-message" key={id}>
              <div
                className="message"
                style={{
                  flexDirection: sender === user ? 'row-reverse' : 'row',
                }}
              >
                <span className="message-name">{sender}</span>
                <span className="message-text">{body}</span>
              </div>
            </div>
          )
        })
      ) : (
        <p style={{ color: '#ccc' }}>No messages...</p>
      )}
    </>
  )
}
export default TabMessages
