import config from './config'
import { createLambdaHandler, intents } from 'mpr-alexa-base'

let handlers = Object.assign(
  intents.launch(config),
  intents.defaultBuiltIns(config),
  intents.askSong(config),
  intents.askShow(config)
)

exports.handler = createLambdaHandler(config, handlers)
