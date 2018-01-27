var skillShare = require('skill-share')
var config = require('./config')
var intents = skillShare.intents
var requestSong = require('./intents/request-song')
var getSongRating = require('./intents/get-song-rating')
var rateSong = require('./intents/rate-current-song')
var playPodcast = require('./intents/play-podcast')

var stateHandler = skillShare.stateHandler('', [
  intents.defaultBuiltIns,
  intents.builtInAudio,
  intents.askShow,
  intents.askSong,
  requestSong,
  getSongRating,
  rateSong,
  playPodcast
])

exports.handler = skillShare
  .skill(config)
  .addHandler(stateHandler)
  .create()
