const RabbitMQ = require('./rabbitmq')

const clientService = async (serviceType, type, callback)=>{
  const queue = 'tasks'
  try {
    const rabbitMQ = new RabbitMQ()
    await rabbitMQ.createChannel()
    const q = await rabbitMQ.createClientQueue()
    const correlationId = rabbitMQ.generateUuid()

    rabbitMQ.sendToServer(serviceType, queue, q, correlationId)

    if (type == 'async') {
      callback(JSON.stringify({
        success: true,
        message: 'success',
        jobID: correlationId
      }))
    }

    rabbitMQ.consumeByClient(q.queue, correlationId, async (data)=>{
      if (type !== 'async') {
        callback(data.content)
        }
      setTimeout(function() {
        rabbitMQ.connection.close()
      }, 500)
    })
  } catch (error) {
    console.log('channel not created', error) 
    callback({
      success: false,
      message: 'server error'
    })
    process.exit(0)
  }
}

module.exports = clientService
