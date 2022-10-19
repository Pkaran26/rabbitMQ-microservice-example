const amqplib = require('amqplib')

const { getPosts, getComments, getUsers } = require('./services')

let cache = []

const createQueue = async (queue)=>{
  try {
    const conn = await amqplib.connect('amqp://localhost')
    const channel = await conn.createChannel()
    await channel.assertQueue(queue, {durable: false})
    console.log('Awaiting requests')
    return channel
  } catch (error) {
    return ''
  }
}

const consume = async (channel, queue, callback)=>{
  channel.consume(queue, function reply(msg) {
    console.log('Received Message: ', msg.content.toString());

    callback({
      content: msg.content.toString(),
      replyTo: msg.properties.replyTo,
      correlationId: msg.properties.correlationId
    })
    channel.ack(msg)
  })
}

const sendToQueue = (channel, payload, replyTo, correlationId)=>{
  channel.sendToQueue(replyTo,
    Buffer.from(payload), {
      correlationId: correlationId
    }
  )
}

const filterService = async (content) =>{
  if (content == 'posts') {
    return await getPosts()
  } else if (content == 'comments') {
    return await getComments()
  } else if (content == 'users') {
    return await getUsers()
  }
}


const rmqServer = async ()=>{
  const queue = 'tasks'
  try {
    const channel = await createQueue(queue)
    consume(channel, queue, async (data)=>{
      const payload = await filterService(data.content)
      cache = [...cache, {
        jobID: data.correlationId,
        payload: payload
      }]
      sendToQueue(channel, JSON.stringify({jobID: data.correlationId, ...payload}), data.replyTo, data.correlationId)
    })
  } catch (error) {
    console.log('channel not created'); 
  }
}

module.exports = rmqServer