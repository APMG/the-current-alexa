const stationSlug = 'the-current'
const config = {
  APP_ID: 'amzn1.ask.skill.507b6759-42a6-4fc9-82b5-95043b7fee00',
  STATION_SLUG: stationSlug,
  STATION_NAME: 'The Current',
  DEFAULT_SHOW_NAME: 'Current Music',
  STREAM_URL: 'https://current.stream.publicradio.org/kcmp.mp3',
  NOW_PLAYING_URL: 'https://nowplaying.publicradio.org/' + stationSlug,
  CARD_TITLE: 'The Current Live Stream',
  CARD_CONTENT: 'Great music lives here. From Minnesota Public Radio.',
  SPOKEN_WELCOME: 'Welcome to The Current',
  SPOKEN_HELP: 'You can tell me to play and pause, or ask about what\'s currently playing',
  SPOKEN_UNHANDLED: 'I don\'t know how to interpret that',
  SPOKEN_CANNOT_FIND: 'Sorry, I can\'t find that information right now',
  SPOKEN_ILLOGICAL: 'I can\'t do that - this is a live stream',
  SPOKEN_ERROR: 'Something went wrong. I was unable to complete your request'
}

export default config
