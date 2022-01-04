import './App.css'
import { useState, useEffect, useRef } from 'react'
import { Button, Input, message, Tabs } from 'antd'
import useChat, { clearMessages } from './useChat'

const { TabPane } = Tabs

function App() {
  const { status, messages, sendMessage } = useChat()
  const [username, setUsername] = useState('')
  const [body, setBody] = useState('') // textBody
  const [isModalVisible, setIsModalVisible] = useState(true)

  const messageRef = useRef()

  // Tabs Contorl START
  const [newTabIndex, setNewTabIndex] = useState(0)
  const [panes, setPanes] = useState([
    { title: 'Tab 1', content: 'Content of Tab Pane 1', key: '1' },
    { title: 'Tab 2', content: 'Content of Tab Pane 2', key: '2' },
  ])
  const [activeKey, setActiveKey] = useState(panes[0].key)

  const onTabChange = (activeKey) => {
    setActiveKey(activeKey)
  }

  const add = () => {
    const activeKey = `newTab${newTabIndex + 1}`
    setNewTabIndex(newTabIndex + 1)
    panes.push({ title: 'New Tab', content: 'New Tab Pane', key: activeKey })
    setActiveKey(activeKey)
    setPanes(panes)
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
        add(targetKey)
        break
      case 'remove':
        remove(targetKey)
        break
      default:
    }
  }
  // Tabs Contorl END

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
    const storgeUsername = localStorage.getItem('username')
    if (storgeUsername !== null) {
      setUsername(storgeUsername)
    }
  }, [])

  useEffect(() => {
    messageRef.current.scrollTop = messageRef.current.scrollHeight
  }, [isModalVisible])

  useEffect(() => {
    messageRef.current.scrollTop = messageRef.current.scrollHeight
    displayStatus(status)
  }, [status])

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
              {messages.length === 0 ? (
                <p style={{ color: '#ccc' }}>No messages...</p>
              ) : (
                !isModalVisible &&
                messages.map(({ name, body }, i) => (
                  <div className="App-message" key={i}>
                    <div
                      className="message"
                      style={{
                        flexDirection:
                          name === username ? 'row-reverse' : 'row',
                      }}
                    >
                      <span className="message-name">{name}</span>
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
          sendMessage({ name: username, body: msg })
          setBody('')
        }}
      ></Input.Search>

      <div
        className="modal"
        style={{ display: isModalVisible ? 'flex' : 'none' }}
      >
        <div className="modal-container">
          <h1>My Chat Room</h1>
          <Input.Search
            placeholder="Username"
            enterButton="Sign in"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 10 }}
            onSearch={(input) => {
              if (input.length === 0)
                return displayStatus({
                  type: 'error',
                  msg: "Username can't be empty",
                })
              setIsModalVisible(false)
              localStorage.setItem('username', input)
            }}
          ></Input.Search>
        </div>
      </div>
    </div>
  )
}

export default App
