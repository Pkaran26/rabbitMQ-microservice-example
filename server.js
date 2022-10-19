const amqplib = require('amqplib')

const { getPosts, getComments, getUsers } = require('./services')

const cache = []

const createQueue = async (queue)=>{
  // const queue = 'tasks'
  const conn = await amqplib.connect('amqp://localhost')
  const channel = await conn.createChannel()
  await channel.assertQueue(queue, {durable: false})
  console.log('Awaiting requests')
  return channel
}

const consume = async (channel, queue, callback)=>{
  channel.consume(queue, function reply(msg) {
    console.log(msg.content.toString())
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


const main = async ()=>{
  const queue = 'tasks'
  const channel = await createQueue(queue)
  consume(channel, queue, async (data)=>{
    const payload = await filterService(data.content)
    sendToQueue(channel, JSON.stringify(payload), data.replyTo, data.correlationId)
  })
}

main()



// var amqp = require('amqplib/callback_api')

// amqp.connect('amqp://localhost', function(error0, connection) {
//     if (error0) {
//         throw error0
//     }
//     connection.createChannel(function(error1, channel) {
//         if (error1) {
//             throw error1
//         }
//         var queue = 'tasks'

//         channel.assertQueue(queue, {
//             durable: false
//         })
//         channel.prefetch(1)
//         console.log(' [x] Awaiting RPC requests')
//         channel.consume(queue, function reply(msg) {
//             var n = parseInt(msg.content.toString())

//             console.log(" [.] fib(%d)", n)

//             var r = fibonacci(n)

//             channel.sendToQueue(msg.properties.replyTo,
//                 Buffer.from(r.toString()), {
//                     correlationId: msg.properties.correlationId
//                 })

//             channel.ack(msg)
//         })
//     })
// })

// function fibonacci(n) {
//     return n * n
// }
