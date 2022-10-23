const RabbitMQ = require('../rabbitmq')
const { getProducts } = require('./services')

const filterService = async (content) =>{
  console.log('content ', content);
  if (content == 'products') {
    return await getProducts()
  } else {
    return {
      status: false,
      message: 'shop path not found'
    }
  }
}

const shopManager = async ()=>{
  const queue = 'shop'
  try {
    const rabbitMQ = new RabbitMQ()
    await rabbitMQ.createChannel()
    await rabbitMQ.createServerQueue(queue)

    rabbitMQ.consumeByServer(queue, async (data)=>{
      const payload = await filterService(data.content)
      rabbitMQ.sendToClient(JSON.stringify(payload), data.replyTo, data.correlationId)
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

module.exports = shopManager
