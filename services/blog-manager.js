const RabbitMQ = require('../rabbitmq')
const { getPosts, getComments, getUsers } = require('./services')

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

const blogManager = async ()=>{
  const queue = 'blog'
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

module.exports = blogManager
