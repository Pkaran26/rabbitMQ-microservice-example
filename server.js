const express = require('express');
const cors = require('cors');
const rmqServer = require('./rmq-server');
const clientService = require('./client');

const app = express();
rmqServer()

app.use(express.json())
app.use(cors())

app.get('/api/:type', async (req, res)=>{
  await clientService(req.params.type, (data)=>{
    res.json(JSON.parse(data))
  })
})

app.listen(3000, ()=>{
  console.log('listening on port 3000')
})