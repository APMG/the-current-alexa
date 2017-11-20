var got = require('got')
var config = require('../config')
var get = require('lodash.get')

var currentSong

module.exports = function () {
  return {
    'GetSongRatingIntent': function () {
      var nowPlayingUrl = config.NOW_PLAYING_URL + '/playlist'
      got(nowPlayingUrl).then(
        handleNowPlayingSuccess.bind(this),
        handleNowPlayingError.bind(this)
      )
    }
  }
}

function handleNowPlayingSuccess (res) {
  let body = JSON.parse(res.body)
  let songs = get(body, 'data.songs', null)

  if (!songs || !songs.length || !songs[0]) {
    this.emit(':tell', config.SPOKEN_CANNOT_FIND)
    return
  }
  currentSong = songs[0]
  var ratingsUrl = config.SONG_RATING_URL + currentSong.song_id
  got(ratingsUrl).then(
    handleRatingsSuccess.bind(this),
    handleRatingsError.bind(this)
  )
}

function handleNowPlayingError (err) {
  console.log(err)
  this.emit(':tell', 'There was an error retrieving playlist data')
}

function handleRatingsSuccess (res) {
  var body = JSON.parse(res.body)
  var ratingAtts = get(body, 'data[0].attributes')

  if (!ratingAtts) {
    this.emit(':tell', 'I was unable to find rating information for this song.')
    return
  }

  var msg = 'The song ' +
    currentSong.title + ' by ' + currentSong.artist

  if (!ratingAtts.count > 0) {
    this.emit(':tell', msg + ' has never been rated before.')
    return
  }
  var times = ratingAtts.count === 1 ? 'time' : 'times'
  msg += ' has been rated ' +
    ratingAtts.count + ' ' + times + ', ' +
    'with an average rating of ' +
    (Math.round(ratingAtts.average * 10) / 10) +
    ' out of 5.'

  this.emit(':tell', msg)
}

function handleRatingsError (err) {
  console.log(err)
  this.emit(':tell', 'There was an error retrieving ratings data')
}
