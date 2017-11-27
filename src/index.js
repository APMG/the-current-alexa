var config = require('./config')
var base = require('mpr-alexa-base')
var intents = base.intents
var createLambdaHandler = base.createLambdaHandler
var requestSong = require('./intents/request-song')
var getSongRating = require('./intents/get-song-rating')
var rateSong = require('./intents/rate-current-song')

let baseHandlers = Object.assign(
  intents.defaultBuiltIns(config),
  intents.builtInAudio(config),
  intents.askSong(config),
  intents.askShow(config),
  intents.playPodcast(config),
  requestSong(),
  getSongRating(),
  rateSong()
)

exports.handler = createLambdaHandler(config, baseHandlers)
