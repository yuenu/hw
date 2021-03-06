import './App.css'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Input, message, Tabs } from 'antd'
import useChat, { clearMessages } from './useChat'

const { TabPane } = Tabs

function App() {
  const { status, messages, sendMessage } = useChat()
  const [username, setUsername] = useState('')
  const [body, setBody] = useState('') // textBody
  const [isModalVisible, setIsModalVisible] = useState(true)
  const messageRef = useRef()
  //  hw9
  const [receiver, setReceiver] = useState(null)
  const [modalInit, setModalInit] = useState(true)
  const [contentMessage, setContentMessage] = useState(messages)

  const fetchChatContent = useCallback(() => {
    // eslint-disable-next-line array-callback-return
    const getMessages = messages.filter((msg) => {
      if (
        (msg.sender === username && msg.receiver === receiver) ||
        (msg.sender === receiver && msg.receiver === username)
      ) {
        return msg
      }
    })
    setContentMessage(getMessages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, receiver, username])

  const autoScroll = (ref) => {
    if (ref.current && ref.current.scrollHeight)
      ref.current.scrollTop = ref.current.scrollHeight
  }

  // Tabs Contorl START
  const [newTabIndex, setNewTabIndex] = useState(0)
  const [panes, setPanes] = useState([])
  const [activeKey, setActiveKey] = useState((panes[0] && panes[0].key) || null)

  const onTabChange = (activeKey) => {
    setActiveKey(activeKey)
    setReceiver(activeKey)
    fetchChatContent()
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
    fetchChatContent()
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
        setIsModalVisible(true)
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

  useEffect(() => {
    displayStatus(status)
  }, [status])

  // STORAGE USERNAME
  useEffect(() => {
    const storgeUsername = localStorage.getItem('username')
    if (storgeUsername !== null) setUsername(storgeUsername)
  }, [])

  useEffect(() => {
    if (!isModalVisible && !modalInit && receiver) add()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalVisible, modalInit, receiver])

  // WHEN LOADING THE CHAT MESSAGES, AND SCROLL TO THE SCREEN BOTTOM
  useEffect(() => {
    fetchChatContent()
    autoScroll(messageRef)
  }, [fetchChatContent])

  return (
    <div className="App">
      <div className="App-title">
        <h1>
          {!isModalVisible && username.length > 0
            ? `${username}'s Chat Room`
            : 'Simple Chat'}
        </h1>
        <Button type="primary" danger onClick={() => clearMessages()}>
          Clear
        </Button>
      </div>
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
              {contentMessage.length === 0 ? (
                <p style={{ color: '#ccc' }}>No messages...</p>
              ) : (
                !isModalVisible &&
                contentMessage.map(({ sender, body, receiver }, i) => (
                  <div className="App-message" key={i}>
                    <div
                      className="message"
                      style={{
                        flexDirection:
                          sender === username ? 'row-reverse' : 'row',
                      }}
                    >
                      <span className="message-name">{sender}</span>
                      <span className="message-text">{body}</span>
                    </div>
                  </div>
                ))
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
          const message = { sender: username, body: msg, receiver: receiver }
          sendMessage(message)
          setBody('')
        }}
      ></Input.Search>

      <div
        className="modal"
        style={{ display: isModalVisible ? 'flex' : 'none' }}
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
                  setIsModalVisible(false)
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
                  setIsModalVisible(false)
                }}
              ></Input.Search>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
