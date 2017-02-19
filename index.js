import Paho from './node_modules/paho-client/src/mqttws31.js'
import debug from 'debug'

// enable with localStorage.debug = '*'
const mtq_debug = debug('MQT')
const paho_debug = debug('MQT:PAHO')

export default function MQT(_host) {

  const _subs = []
  const _outbox = []

  const host_parts = _host.replace(/wss?:\/\//,'').split(':')

  var host = host_parts[0] || 'localhost'
  var port = parseInt(host_parts[1]) || 8083
  var clientID = 'mqt_' + Math.random().toString(32).substr(2,5)

  mtq_debug(`Connecting to host=${host} port=${port}`)

  const client = new Paho.MQTT.Client(host, port, clientID)

  // set callback handlers
  client.onConnectionLost = onConnectionLost
  client.onMessageArrived = onMessageArrived

  // connect the client
  function connect() {
    client.connect({
      onSuccess:onConnect,
      timeout: 3,
      onFailure: function (message) {
        paho_debug("FAILED", message)
        console.error("FAILED TO CONNECT", message)
      }
    })
  }

  connect()

  const send = this._send = (topic, message) => {
    message = new Paho.MQTT.Message(message)
    message.destinationName = topic
    client.send(message)
  }


  // called when the client connects
  // do subscriptions etc
  function onConnect() {
    paho_debug("Connected")

    // initial connections
    _subs.forEach(([topic, callback]) => {
      paho_debug(`subscribing to ${topic}`)
      client.subscribe(topic)
    })

    // send off outbox messages
    while(_outbox.length) {
      const content = _outbox.pop()
      const message = new Paho.MQTT.Message(
        JSON.stringify(content[1])
      )
      message.destinationName = content[0]
      client.send(message)
    }

  }

  // called when the client loses its connection
  function onConnectionLost(responseObject) {
    paho_debug(`Connection lost ${responseObject.errorMessage}`)
    if (responseObject.errorCode !== 0) {
      paho_debug(`Reconnecting`)
      setTimeout(connect, 1000)
    }
  }

  // called when a message arrives
  function onMessageArrived(message) {
    paho_debug(`Message Arrived`)

    const target = message.destinationName
    const payload = maybe_from_json(message.payloadString)

    _subs.forEach(([topic, callback]) => {
      // todo: pattern match
      if(topic == target)
        callback(payload)

    })
  }

  function maybe_from_json(whatever) {
    try {
      return JSON.parse(whatever)
    } catch (e) {
      return whatever
    }
  }

  return {
    subscribe: (topic, callback) => {
      _subs.push([topic, callback])
      if(client.isConnected()) {
        client.subscribe(topic)
      }
    },
    publish: (topic, payload) => {
      if(client.isConnected()) {
        const message = new Paho.MQTT.Message(
          JSON.stringify(payload)
        )
        message.destinationName = topic
        client.send(message)
      } else {
        _outbox.push([topic, payload])
      }
    }
  }
}
