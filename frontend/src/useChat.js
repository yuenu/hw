import { useState } from "react";
const client = new WebSocket('ws://localhost:4000')

// import { sendData } from "../../backend/wssConnect";

const sendData = async (data) => {
    console.log("Sending data");
    console.log(data);
    await client.send(
        JSON.stringify(data));
};

const useChat = () => {

    //define messages, status
    const [ messages, setMessages] = useState([]);
    const [ status, setStatus] = useState({});
    //define sendMessage, sendData
    const sendMessage = (payload) => {
        sendData(["input", payload]); 
    };

    client.onmessage = (byteString) => {
        const { data } = byteString;
        const [task, payload] = JSON.parse(data);    
        switch (task) {
          case "output": {
            console.log("Receiving data");
            console.log(payload);
            setMessages(() =>  
            [...messages, ...payload]); break; }
        case "status": {
            setStatus(payload); break; }
          default: break;
        }
      }


    return {
        status,
        messages,
        sendMessage
    };
};

export default useChat;