import config from './config'
import mprAlexaBase from 'mpr-alexa-base'
import get from 'lodash.get'

let handlers = mprAlexaBase.getIntentHandlers(config)

handlers['RequestSongIntent'] = function () {
  let token = get(this, 'event.session.user.accessToken')

  if (!token) {
    this.emit(
      ':tellWithLinkAccountCard',
      'You need to link your APM account to this skill before you can request a song'
    )
  }

  this.emit(':tell', 'You are logged in. Let\'s have a little dialogue about this')
}

exports.handler = mprAlexaBase.createLambdaHandler(handlers)
