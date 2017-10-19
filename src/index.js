import config from './config'
import mprAlexaBase from 'mpr-alexa-base'

let handlers = mprAlexaBase.getIntentHandlers(config)

handlers['RequestSongIntent'] = function () {
  this.emit(
    ':tellWithLinkAccountCard',
    'You need to link your APM account to this skill before you can request a song'
  )
}

exports.handler = mprAlexaBase.createLambdaHandler(handlers)
