const RabbitMQ = require('./rabbitmq')
var fs = require('fs')
const { getPosts, getComments, getUsers } = require('./services')

let cache = []


const consume = async (channel, queue, callback)=>{
  channel.consume(queue, function reply(msg) {
    console.log('Received Message: ', msg.content.toString())

    callback({
      content: msg.content.toString(),
      replyTo: msg.properties.replyTo,
      correlationId: msg.properties.correlationId
    })
    channel.ack(msg)
  })
}

const filterService = async (content) =>{
  if (content == 'posts') {
    return await getPosts()
  } else if (content == 'comments') {
    return await getComments()
  } else if (content == 'users') {
    return await getUsers()
  } else {
    return {
      status: false,
      message: 'path not found'
    }
  }
}


const rmqServer = async ()=>{
  const queue = 'tasks'
  try {
    const rabbitMQ = new RabbitMQ()
    await rabbitMQ.createChannel()
    await rabbitMQ.createServerQueue()

    consume(rabbitMQ.channel, queue, async (data)=>{
      const payload = await filterService(data.content)
      cache = [...cache, {
        jobID: data.correlationId,
        payload: payload
      }]
      fs.writeFile('cache.txt', JSON.stringify(cache, null, 2), function (err) {
        if (err) throw err
        console.log('Cache Saved')
      })
      rabbitMQ.sendToClient(JSON.stringify({jobID: data.correlationId, ...payload}), data.replyTo, data.correlationId)
    })
  } catch (error) {
    console.log('channel not created') 
  }
}

module.exports = rmqServer