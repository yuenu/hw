import './App.css'
import { useState, useEffect } from 'react'
import { Button, Input, Tag, message } from 'antd'
import useChat, { clearMessages } from './useChat'

function App() {
  const { status, messages, sendMessage } = useChat()
  const [username, setUsername] = useState('')
  const [body, setBody] = useState('')  // textBody
  const [isModalVisible, setIsModalVisible] = useState(true);

  const displayStatus = (payload) => {
    if (payload.msg) {
      const { type, msg } = payload
      const content = {
        content: msg, duration: 0.5 }
      switch (type) {
        case 'success':
          message.success(content)
          break
        case 'error':
        default:
          message.error(content)
          break
  }}}

  useEffect(() => {
    const storgeUsername = localStorage.getItem('username')
    if(storgeUsername !== null ) {
      setUsername(storgeUsername)
    }
  }, [])

  useEffect(() => {
    displayStatus(status)}, [status])


  return (
    <div className="App">
      <div className="App-title">
        <h1>{!isModalVisible && username.length > 0 ? `${username}'s Chat Room` : 'Simple Chat'}</h1>
        <Button type="primary" danger onClick={() => clearMessages()} >
          Clear
        </Button>
      </div>

      <div className="App-messages">
        {messages.length === 0 ? (
        <p style={{ color: '#ccc' }}>No messages...</p>
        ) : (
          messages.map( ({ name, body }, i) => (
            <p className="App-message" key={i}>
                <Tag color="blue">{name}</Tag> {body}
            </p> 
        ))
      )}
      </div>

      
      <Input.Search
        value={body}
        onChange={(e) => setBody(e.target.value)}
        enterButton="Send"
        placeholder="Type a message here..."
        onSearch={ (msg) =>{
          sendMessage({ name:username, body:msg })
          setBody('')
        }}

      ></Input.Search>

      <div className="modal" style={{ display: isModalVisible ? 'flex' : 'none'}}>
        <div className="modal-container">
          <h1>My Chat Room</h1>
          <Input.Search
            placeholder="Username"
            enterButton="Sign in"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: 10 }}
            onSearch={(input) => {
              if(input.length === 0) return displayStatus({ type: 'error', msg: 'Username can\'t be empty' })
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