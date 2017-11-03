var config = require('./config').default
var base = require('mpr-alexa-base')
var intents = base.intents
var createLambdaHandler = base.createLambdaHandler
var requestSong = require('./intents/request-song').default

let handlers = Object.assign(
  intents.defaultBuiltIns(config),
  intents.builtInAudio(config),
  intents.askSong(config),
  intents.askShow(config),
  requestSong()
)

exports.handler = createLambdaHandler(config, handlers)
