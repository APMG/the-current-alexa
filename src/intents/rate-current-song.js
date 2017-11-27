var got = require('got')
var config = require('../config')
var get = require('lodash.get')
var user = require('mpr-alexa-base').user
var qFlat = require('q-flat')

var customTokenMsg = '' +
  'Account Linking is required to rate songs. ' +
  'Go to The Current custom skill in your Alexa app ' +
  'to link your account.'

module.exports = function () {
  return {
    'RateCurrentSongIntent': function () {
      var token = user(this).getToken(customTokenMsg)

      // This is necessary (here and in `getUser`) due to some async
      // node / lambda quirks that contradict the alexa node sdk docs
      // stating that execution halts after certain calls to `this.emit`
      // https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/208#issuecomment-341231525
      // ~EMN
      if (!token) { return }

      if (!this.attributes.user) {
        user(this).getUser(
          getUserSuccess.bind(this),
          getUserFail.bind(this)
        )
      } else if (!this.event.request.intent.slots.Song.value) {
        // will look up song and set it as "Song" on intent
        lookupSong.call(this)
      } else {
        delegateOrSendRequest.call(this)
      }
    }
  }
}

function getUserSuccess (res) {
  this.attributes['user'] = res.body.user
  lookupSong.call(this)
}

function getUserFail (err) {
  console.error(err.statusCode, err.response.body)
  end.call(this, 'Sorry, there was an error retrieving your account data. Please try again later.')
}

function delegateOrSendRequest (updatedIntent) {
  var complete = this.event.request.dialogState === 'COMPLETED'
  var confirmationStatus = this.event.request.intent.confirmationStatus
  var rating = this.event.request.intent.slots.Rating.value

  // just a little validation on the rating ...
  if (rating && [1, 2, 3, 4, 5].indexOf(parseInt(rating)) === -1) {
    elicitUnrecognizedRating.call(this)
    return
  }

  if (complete && confirmationStatus === 'CONFIRMED') {
    sendSongRating.call(this)
  } else if (complete && confirmationStatus === 'DENIED')
    end.call(this, 'Please try rating the song again')
  } else {
    this.emit(':delegate', updatedIntent || null)
  }
}

function sendSongRating (rating) {
  var accessToken = user(this).getToken(customTokenMsg)
  if (!accessToken) { return }

  var userId = this.attributes.user.uid
  var form = config.FORMS.RATE_A_SONG
  var action = form.action + userId + '/ratings'
  var data = Object.assign(form.data, {
    ratable_id: this.attributes.song.song_id,
    value: this.event.request.intent.slots.Rating.value
  })

  var formConfig = {
    method: 'POST',
    form: true,
    'content-type': 'application/x-www-form-urlencoded',
    followRedirect: false,
    headers: {
      authorization: 'Bearer ' + accessToken
    },
    body: qFlat.flatten(data)
  }
  got(action, formConfig).then(
    rateSongSuccess.bind(this),
    rateSongFail.bind(this)
  )
}

function rateSongSuccess (res) {
  end.call(this, 'Cool. I just recorded your song rating.')
}

function rateSongFail (err) {
  console.error(err)
  end.call(this, 'Sorry, there was an error sending your song rating.')
}

function lookupSong () {
  got(config.NOW_PLAYING_URL + '/playlist').then(
    songLookupSuccess.bind(this),
    songLookupFail.bind(this)
  )
}

function songLookupSuccess (res) {
  var body = JSON.parse(res.body)
  var song = get(body, 'data.songs[0]')
  var updatedIntent = this.event.request.intent

  if (!song) {
    end.call(this, 'Sorry, I wasn\'t able to find the current song.')
    return
  }
  this.attributes.song = song
  updatedIntent.slots.Song.value = song.title + ' by ' + song.artist
  delegateOrSendRequest.call(this, updatedIntent)
}

function songLookupFail (err) {
  console.error(err)
  end.call(this, 'Sorry, there was an error looking up song data.')
}

function elicitUnrecognizedRating () {
  var updatedIntent = this.event.request.intent
  delete updatedIntent.slots.Rating.value
  var prompt = 'Please say one, two, three, four or five.'
  this.emit(
    ':elicitSlot',
    'Rating',
    'I didn\'t quite understand your rating. ' + prompt,
    prompt,
    updatedIntent
  )
}

function end (msg) {
  // this function is necessary in order to delete the song from
  // the attributes array. We want to hang on to it, during
  // the session, but it contains values that cannot be
  // stored in DynamoDB, i.e, empty strings ~EMN
  delete this.attributes.song
  this.emit(':tell', msg)
}
