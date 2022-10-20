const RabbitMQ = require('./rabbitmq')

const rmqServer = async ()=>{
  const taskQueue = 'tasks'
  const serviceQueue = 'service'
  try {
    const rabbitMQ = new RabbitMQ()
    await rabbitMQ.createChannel()
    await rabbitMQ.createServerQueue(taskQueue)

    rabbitMQ.consumeByServer(taskQueue, async (data)=>{
      const childRabbitMQ = new RabbitMQ()
      await childRabbitMQ.createChannel()
      
      const q = await childRabbitMQ.createClientQueue()
      const correlationId = childRabbitMQ.generateUuid()
      childRabbitMQ.sendToServer(data.content, serviceQueue, q, correlationId)

      childRabbitMQ.consumeByClient(q.queue, correlationId, async (reply)=>{
        const payload = {
          jobID: data.correlationId,
          data: JSON.parse(reply.content)
        }
        rabbitMQ.addToCache(data.correlationId, payload)
        rabbitMQ.sendToClient(JSON.stringify(payload), data.replyTo, data.correlationId)

        setTimeout(function() {
          childRabbitMQ.connection.close()
        }, 500)
      })
    })
  } catch (error) {
    console.log('channel not created') 
  }
}

module.exports = rmqServer