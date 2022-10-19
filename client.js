const amqplib = require('amqplib')

const createQueue = async (queue)=>{
  try {
    const connection = await amqplib.connect('amqp://localhost')
    const channel = await connection.createChannel()
    const q = await channel.assertQueue('', {exclusive: true})
    return {connection, channel, q}
  } catch (error) {
    console.log(error);
    return ''
  }
}

const generateUuid = ()=>{
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

const consume = async (channel, queue, correlationId, callback)=>{
  channel.consume(queue, function reply(msg) {
    if (msg.properties.correlationId === correlationId) {
      callback({
        content: msg.content.toString(),
        replyTo: msg.properties.replyTo,
        correlationId: msg.properties.correlationId
      })
      channel.ack(msg)
    }
  })
}

const sendToQueue = (channel, payload, queue, q, correlationId)=>{
  channel.sendToQueue(queue,
    Buffer.from(payload), {
      correlationId: correlationId,
      replyTo: q.queue
    }
  )
}

const clientService = async (serviceType, callback)=>{
  const queue = 'tasks'
  try {
    const {connection, channel, q} = await createQueue(queue)
    const correlationId = generateUuid()
    sendToQueue(channel, serviceType, queue, q, correlationId)

    consume(channel, q.queue, correlationId, async (data)=>{
      callback(data.content);
      setTimeout(function() {
        connection.close();
      }, 500);
    })
  } catch (error) {
    console.log('channel not created', error); 
    callback({
      success: false,
      message: 'server error'
    })
    process.exit(0)
  }
}

//clientService('posts')

module.exports = clientService
