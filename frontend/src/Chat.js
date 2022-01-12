import './App.css'
import { useState, useEffect, useRef } from 'react'
import { Button, Input, message, Tabs } from 'antd'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useMutation,
  split,
  HttpLink,
  useQuery,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

const { TabPane } = Tabs

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
})

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/subscriptions',
  options: {
    reconnect: true,
  },
})

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

const GET_TAB_MESSAGES = gql`
  query GetTabMessages($user: String, $peopleTo: String) {
    getTabMessages(input: { user: $user, peopleTo: $peopleTo }) {
      id
      sender
      body
      receiver
    }
  }
`

const CREATE_MESSAGE = gql`
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

const CLEAR_MESSAGES = gql`
  mutation Mutation {
    clearMessages
  }
`

const MESSAGE_SUB = gql`
  subscription MessageCreated {
    messageCreated {
      id
      sender
      body
      receiver
    }
  }
`

const Header = ({ username, onClear, modalVisible }) => {
  return (
    <div className="App-title">
      <h1>
        {!modalVisible && username.length > 0
          ? `${username}'s Chat Room`
          : 'Simple Chat'}
      </h1>
      <Button type="primary" danger onClick={() => onClear()}>
        Clear
      </Button>
    </div>
  )
}

function TabMessages({ user, peopleTo }) {
  const { data, loading, subscribeToMore } = useQuery(GET_TAB_MESSAGES, {
    variables: {
      user: user,
      peopleTo: peopleTo,
    },
  })

  console.log(user, peopleTo, data)

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

  return (
    <>
      {!loading && data && data.getTabMessages.length > 0 ? (
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

function Chat() {
  const [username, setUsername] = useState('')
  const [body, setBody] = useState('')
  const [receiver, setReceiver] = useState(null)

  const [modalVisible, setModalVisible] = useState(true)
  const [modalInit, setModalInit] = useState(true)

  const messageRef = useRef()

  /**
   * grapgql
   *
   */
  const [createMessage] = useMutation(CREATE_MESSAGE)
  const [clearMessages] = useMutation(CLEAR_MESSAGES)
  const autoScroll = (ref) => {
    if (ref.current && ref.current.scrollHeight)
      ref.current.scrollTop = ref.current.scrollHeight
  }

  // Tabs CONTROL START
  const [newTabIndex, setNewTabIndex] = useState(0)
  const [panes, setPanes] = useState([])
  const [activeKey, setActiveKey] = useState((panes[0] && panes[0].key) || null)

  const onTabChange = (activeKey) => {
    setActiveKey(activeKey)
    setReceiver(activeKey)
    autoScroll(messageRef)
    console.log('tab change')
  }

  const add = () => {
    const tabsUser = panes.map((pane) => pane.key)
    if (!tabsUser.includes(receiver)) {
      setNewTabIndex(newTabIndex + 1)
      panes.push({ title: receiver, key: receiver })
      setPanes(panes)
    }
    setActiveKey(receiver)
    setReceiver(receiver)
  }

  const remove = (targetKey) => {
    let lastIndex
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1
      }
    })
    const tempPanes = panes.filter((pane) => pane.key !== targetKey)
    if (tempPanes.length && activeKey === targetKey) {
      if (lastIndex >= 0) {
        setActiveKey(tempPanes[lastIndex].key)
      } else {
        setActiveKey(tempPanes[0].key)
      }
    }
    setPanes(tempPanes)
  }

  const onTabEdit = (targetKey, action) => {
    switch (action) {
      case 'add':
        setModalVisible(true)
        break
      case 'remove':
        remove(targetKey)
        break
      default:
    }
  }
  // Tabs Contorl END

  // SNACKBAR
  const displayStatus = (payload) => {
    if (payload.msg) {
      const { type, msg } = payload
      const content = {
        content: msg,
        duration: 0.5,
      }
      switch (type) {
        case 'success':
          message.success(content)
          break
        case 'error':
        default:
          message.error(content)
          break
      }
    }
  }

  // STORAGE USERNAME
  useEffect(() => {
    const storgeUsername = localStorage.getItem('username')
    if (storgeUsername !== null) setUsername(storgeUsername)
  }, [])

  useEffect(() => {
    if (!modalVisible && !modalInit && receiver) add()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible, modalInit, receiver])
  useEffect(() => {
    console.log('toggle', messageRef)
  }, [messageRef])

  return (
    <div className="App">
      <Header
        onClear={clearMessages}
        username={username}
        modalVisible={modalVisible}
      />
      <Tabs
        type="editable-card"
        onChange={onTabChange}
        activeKey={activeKey}
        onEdit={onTabEdit}
        style={{ width: '500px' }}
      >
        {panes.map((pane) => (
          <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
            <div className="App-messages" ref={messageRef}>
              {!modalVisible && (
                <TabMessages user={username} peopleTo={receiver} />
              )}
            </div>
          </TabPane>
        ))}
      </Tabs>

      <Input.Search
        value={body}
        onChange={(e) => setBody(e.target.value)}
        enterButton="Send"
        placeholder="Type a message here..."
        onSearch={(msg) => {
          if (msg.length === 0)
            return displayStatus({
              type: 'error',
              msg: 'Message can not be empty',
            })
          createMessage({
            variables: { sender: username, body: msg, receiver: receiver },
          })
          setBody('')
        }}
      ></Input.Search>

      <div
        className="modal"
        style={{ display: modalVisible ? 'flex' : 'none' }}
      >
        <div className="modal-container">
          <h1>My Chat Room</h1>
          {modalInit ? (
            <>
              <h3>Input your username</h3>
              <Input.Search
                placeholder="Username"
                enterButton="Sign in"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onSearch={(input) => {
                  if (input.length === 0)
                    return displayStatus({
                      type: 'error',
                      msg: "Username can't be empty",
                    })
                  setModalVisible(false)
                  setModalInit(false)
                  localStorage.setItem('username', input)
                }}
              ></Input.Search>
            </>
          ) : (
            <>
              <h3>Want chat with?</h3>
              <Input.Search
                placeholder="Chat with?"
                enterButton="Comfirm"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                style={{ marginBottom: 10 }}
                onSearch={(input) => {
                  if (input.length === 0)
                    return displayStatus({
                      type: 'error',
                      msg: "can't be empty",
                    })
                  setModalVisible(false)
                }}
              ></Input.Search>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
)
