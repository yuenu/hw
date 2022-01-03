import WebSocket from 'ws'
import http from 'http'
import dotenv from 'dotenv-defaults'
import mongoose from 'mongoose'
import express from 'express'
import { sendData, sendStatus, initData } from './wssConnect'
import Message from './models/message.js'
//var cors = require('cors');
//const http = require('http');
//const express = require('express');

dotenv.config()

if (!process.env.MONGO_URL) {
  console.error('Missing MONGO_URL!!!')
  process.exit(1)
}
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
//mongoose.connect(process.env.MONGO_URL)

const db = mongoose.connection

db.on('error', (error) => {
  throw new Error('DB connection error: ' + error)
})

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server }) //local object

const broadcastMessage = (data, status) => {
  wss.clients.forEach((client) => {
    sendData(data, client)
    sendStatus(status, client)
  })
}
db.once('open', () => {
  console.log('MongoDB connected!')

  // wss.on('connection', wssConnect)
  wss.on('connection', (ws) => {
    initData(ws)
    ws.onmessage = async (byteString) => {
      const { data } = byteString
      const [task, payload] = JSON.parse(data)
      switch (task) {
        case 'input': {
          const { name, body } = payload
          const message = new Message({ name, body })
          try {
            await message.save()
          } catch (e) {
            throw new Error('Message DB save error: ' + e)
          }
          console.log('message saved')
          broadcastMessage(['output', [payload]], {
            type: 'success',
            msg: 'Message sent.',
          })
          break
        }
        /* // Notification message
            sendData(['output', [payload]], ws)
            sendStatus({
              type: 'success',
              msg: 'Message sent.'
            }, ws)
            break
          */
        case 'clear': {
          Message.deleteMany({}, () =>
            broadcastMessage(['cleared'], {
              type: 'info',
              msg: 'Delete All Messages',
            })
          )
        }
        default:
          break
      }
    }
  })

  const PORT = process.env.port || 4000

  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
  })
})
