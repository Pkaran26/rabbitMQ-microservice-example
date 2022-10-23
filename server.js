const express = require('express')
const cors = require('cors')
const rmqServer = require('./rmq-server')
const blogManager = require('./services/blog-manager')
const shopManager = require('./services/shop-manager')
const clientService = require('./client')
const fs = require('fs')

const app = express()
rmqServer()
blogManager()
shopManager()

app.use(express.json())
app.use(cors())

app.get('/api/:service_type/:api_name/:type', async (req, res)=>{
  const {service_type, api_name, type} = req.params
  await clientService(service_type, api_name, type, (data)=>{
    res.json(JSON.parse(data))
  })
})

app.get('/status/:jobID', async (req, res)=>{
  fs.readFile('./cache.txt', function(err, cache) {
    const data = JSON.parse(cache).filter((e)=>{
      return e.jobID == req.params.jobID
    })
    res.json(data[0])
  })
})

app.listen(3000, ()=>{
  console.log('listening on port 3000')
})