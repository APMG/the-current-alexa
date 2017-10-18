import config from './config'
import mprAlexaBase from 'mpr-alexa-base'

mprAlexaBase.setConfig(config)
exports.handler = mprAlexaBase.createLambdaHandler()
