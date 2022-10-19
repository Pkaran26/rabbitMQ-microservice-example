const express = require('express')
const cors = require('cors')
const rmqServer = require('./rmq-server')
const clientService = require('./client')
var fs = require('fs')

const app = express()
rmqServer()

app.use(express.json())
app.use(cors())

app.get('/api/:api/:type', async (req, res)=>{
  await clientService(req.params.api, req.params.type, (data)=>{
    res.json(JSON.parse(data))
  })
})

app.get('/status/:jobID', async (req, res)=>{
  fs.readFile('./cache.txt', function(err, cache) {
    const data = JSON.parse(cache).filter((e)=>{
      console.log(e.jobID, req.params.jobID)
      return e.jobID == req.params.jobID
    })
    res.json(data[0])
  })
})

app.listen(3000, ()=>{
  console.log('listening on port 3000')
})