const amqplib = require('amqplib')

class RabbitMQ {
  constructor () {
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

}

module.exports = RabbitMQ