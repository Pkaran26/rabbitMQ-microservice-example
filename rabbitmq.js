const amqplib = require('amqplib')
var fs = require('fs')

class RabbitMQ {
  constructor () {
    this.cache = []
    this.connection = ''
    this.channel = ''
  }

  async createChannel () {
    try {
      this.connection = await amqplib.connect('amqp://localhost')
      this.channel = await this.connection.createChannel()
    } catch (error) {
      return ''
    }
  }
  
  async createServerQueue (queue) {
    try {
      console.log('Awaiting requests')
      return await this.channel.assertQueue(queue, {durable: false})
    } catch (error) {
      console.log('queue error: ' + error)
    }
  }

  async createClientQueue () {
    try {
      console.log('Awaiting requests')
      return await this.channel.assertQueue('', {exclusive: true})
    } catch (error) {
      console.log('queue error: ' + error)
    }
  }

  generateUuid () {
    return Math.random().toString() + Math.random().toString() + Math.random().toString()
  }

  addToCache (jobID, payload) {
    this.cache = [...this.cache, payload]
    fs.writeFile('cache.txt', JSON.stringify(this.cache, null, 2), function (err) {
      if (err) {
        return console.log('Cache not saved')
      }
      console.log('Cache saved')
    })
  }

  sendToClient (payload, replyTo, correlationId) {
    this.channel.sendToQueue(replyTo,
      Buffer.from(payload), {
        correlationId: correlationId
      }
    )
  }

  sendToServer (payload, queue, q, correlationId) {
    this.channel.sendToQueue(queue,
      Buffer.from(payload), {
        correlationId: correlationId,
        replyTo: q.queue
      }
    )
  }

  consumeByServer = async (queue, callback)=>{
    const _vm = this
    this.channel.consume(queue, function reply(msg) {
      console.log('Received Message: ') //msg.content.toString()
  
      callback({
        content: msg.content.toString(),
        ...msg.properties
      })
      _vm.channel.ack(msg)
    })
  }


  consumeByClient = (queue, correlationId, callback)=>{
    const _vm = this
    this.channel.consume(queue, function reply(msg) {
      if (msg.properties.correlationId === correlationId) {
        callback({
          content: msg.content.toString(),
          ...msg.properties
        })
        _vm.channel.ack(msg)
      }
    })
  }

}

module.exports = RabbitMQ