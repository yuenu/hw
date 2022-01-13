import { Button } from 'antd'

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

export default Header
