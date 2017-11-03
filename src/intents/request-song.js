var got = require('got')
var get = require('lodash.get')
var set = require('lodash.set')
var qFlat = require('q-flat')
var toTitle = require('to-title-case')
var config = require('../config').default
var apiUrl = 'https://accounts.publicradio.org/api/v1/'

export default function () {
  return {
    'RequestSongIntent': function () {
      var token = getToken.call(this)

      // This is necessary (here and in `getUser`) due to some async
      // node / lambda quirks that contradict the alexa node sdk docs
      // stating that execution halts after certain calls to `this.emit`
      // https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/208#issuecomment-341231525
      // ~EMN
      if (!token) { return }

      if (!this.attributes['user']) {
        getUser.call(this)
        return null
      } else {
        delegateOrSendRequest.call(this)
      }
    }
  }
}

const delegateOrSendRequest = function () {
  var complete = this.event.request.dialogState !== 'COMPLETED'
  var confirmationStatus = this.event.request.intent.confirmationStatus

  if (complete && confirmationStatus === 'CONFIRMED') {
    var song = this.event.request.intent.slots.Song.value
    var artist = this.event.request.intent.slots.Artist.value
    sendSongRequest.call(this, song, artist)
  } else if (complete && confirmationStatus === 'DENIED') {
    this.emit(':tell', 'Please try making your request again')
  } else {
    this.emit(':delegate')
  }
}

const sendSongRequest = function (song, artist) {
  var formBody = config.FORMS.SONG_REQUEST.data
  var firstNamePath = 'subscription_request.sde_fsm.Form_FirstName'
  var lastNamePath = 'subscription_request.sde_fsm.Form_LastName'
  var songArtistPath = 'subscription_request.sde.Form_Song_and_Artist_Name'
  var emailPath = 'subscription_request.sde_fsm.Form_Email_Address'

  this.requestedSongAndArtist = toTitle(song) + ' by ' + toTitle(artist)

  set(formBody, songArtistPath, this.requestedSongAndArtist)
  set(formBody, emailPath, get(this, 'attributes.user.email'))
  set(formBody, firstNamePath, get(this, 'attributes.user.profile.first_name'))
  set(formBody, lastNamePath, get(this, 'attributes.user.profile.last_name'))

  var formConfig = {
    method: 'POST',
    form: true,
    'content-type': 'application/x-www-form-urlencoded',
    followRedirect: false,
    body: qFlat.flatten(formBody)
  }

  got(config.FORMS.SONG_REQUEST.action, formConfig).then(
    songRequestSuccess.bind(this),
    songRequestFail.bind(this)
  )
}

const songRequestSuccess = function (res) {
  this.emit(
    ':tellWithCard',
    'Cool. I just sent your request to The Current.',
    'You Requested a Song',
    'Your request for ' + this.requestedSongAndArtist + ' was sent to The Current'
  )
}

const songRequestFail = function (err) {
  if (err.statusCode >= 300 && err.statusCode <= 399) {
    this.emit(':tell', 'Cool. I just sent your request to The Current.')
  } else {
    console.log(err.statusCode, err.response.body)
    this.emit(':tell', 'Sorry, there was an error requesting your song!')
  }
}

const getToken = function () {
  this.token = get(this, 'event.session.user.accessToken')

  if (!this.token) {
    this.emit(
      ':tellWithLinkAccountCard',
      'You need to link your APM account to this skill before you can request a song'
    )
    return false
  }
  return this.token
}

const getUser = function () {
  var token = getToken.call(this)

  if (!token) { return }

  if (!this.attributes['user']) {
    var requestConfig = {
      headers: {
        authorization: 'Bearer ' + token,
        timeout: 2500,
        'content-type': 'application/json'
      },
      json: true
    }

    var url = apiUrl + 'me'

    got(url, requestConfig).then(
      getUserSuccess.bind(this),
      handleError.bind(this)
    )
  }
}

const getUserSuccess = function (res) {
  this.attributes['user'] = res.body.user
  this.emit(':saveState')
  this.emit(':delegate')
}

const handleError = function (err) {
  console.log(err.statusCode, err.response.body)
  this.emit(':tell', 'Sorry, there was an error. Please try again later.')
}
