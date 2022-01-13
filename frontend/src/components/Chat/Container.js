import { useState, useEffect, useRef, useCallback } from 'react'
import { Input, Tabs } from 'antd'
import { useMutation } from '@apollo/client'
import { CREATE_MESSAGE, CLEAR_MESSAGES } from './server'
import Header from './Header'
import TabMessages from './TabMessages'
const { TabPane } = Tabs

const Container = () => {
  const [username, setUsername] = useState('')
  const [body, setBody] = useState('')
  const [receiver, setReceiver] = useState(null)

  const [modalVisible, setModalVisible] = useState(true)
  const [modalInit, setModalInit] = useState(true)
  const messageRef = useRef()

  /**
   * grapgql
   */
  const [createMessage] = useMutation(CREATE_MESSAGE)
  const [clearMessages] = useMutation(CLEAR_MESSAGES)
  // const autoScroll = (ref) => {
  //   if (ref.current && ref.current.scrollHeight)
  //     ref.current.scrollTop = ref.current.scrollHeight
  // }

  // Tabs CONTROL START
  const [newTabIndex, setNewTabIndex] = useState(0)
  const [panes, setPanes] = useState([])
  const [activeKey, setActiveKey] = useState((panes[0] && panes[0].key) || null)

  const onTabChange = (activeKey) => {
    setActiveKey(activeKey)
    setReceiver(activeKey)
  }

  const add = useCallback(() => {
    const tabsUser = panes.map((pane) => pane.key)
    if (!tabsUser.includes(receiver)) {
      setNewTabIndex(newTabIndex + 1)
      panes.push({ title: receiver, key: receiver })
      setPanes(panes)
    }
    setActiveKey(receiver)
    setReceiver(receiver)
  }, [newTabIndex, panes, receiver])

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
  // Tabs CONTROL END

  // STORAGE USERNAME
  useEffect(() => {
    const storgeUsername = localStorage.getItem('username')
    if (storgeUsername !== null) setUsername(storgeUsername)
  }, [])

  useEffect(() => {
    if (!modalVisible && !modalInit && receiver) add()
  }, [modalVisible, modalInit, receiver, add])

  console.log('Render tab Chat component')

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
                <TabMessages
                  user={username}
                  peopleTo={receiver}
                  messageRef={messageRef}
                />
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
          // if (msg.length === 0)
          //   return displayStatus({
          //     type: 'error',
          //     msg: 'Message can not be empty',
          //   })
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
                  // if (input.length === 0)
                  //   return displayStatus({
                  //     type: 'error',
                  //     msg: "Username can't be empty",
                  //   })
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
                  // if (input.length === 0)
                  //   return displayStatus({
                  //     type: 'error',
                  //     msg: "can't be empty",
                  //   })
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
export default Container
