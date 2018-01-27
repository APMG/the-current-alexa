const stationSlug = 'the-current'
module.exports = {
  APP_ID: 'amzn1.ask.skill.507b6759-42a6-4fc9-82b5-95043b7fee00',
  STATION_SLUG: stationSlug,
  STATION_NAME: 'The Current',
  DEFAULT_SHOW_NAME: 'Current Music',
  DYNAMODB_TABLE_NAME: 'mpr_alexa',
  STREAM_URL: 'https://current.stream.publicradio.org/current.aac',
  NOW_PLAYING_URL: 'https://nowplaying.publicradio.org/' + stationSlug,
  SONG_RATING_URL: 'https://ratingapi.publicradio.org/ratables/the-current-song/',
  CARD_TITLE: 'The Current Live Stream',
  CARD_CONTENT: 'Great music lives here. From Minnesota Public Radio.',
  SPOKEN_WELCOME: 'Welcome to The Current',
  SPOKEN_HELP: 'You can tell me to play and pause, ask about what\'s currently playing, or request a song',
  SPOKEN_UNHANDLED: 'I don\'t know how to interpret that',
  SPOKEN_CANNOT_FIND: 'Sorry, I can\'t find that information right now',
  SPOKEN_ILLOGICAL: 'I can\'t do that - this is a live stream',
  SPOKEN_ERROR: 'Something went wrong. I was unable to complete your request',
  HOST_PHONEMES: {
    'Lucia': 'lutS"i@'
  },
  FORMS: {
    SONG_REQUEST: {
      'action': 'https://mcpostman.publicradio.org/subscription_requests',
      'data': {
        'subscription_request': {
          'property_key': '1338d9da-71e1-4346-b5a4-0d3fe0e81faf',
          'notification_list': 'f2b245e4-b900-49f5-b84e-b3ea70fbebca',
          'sde_external_key': 'Current_AlexaSongRequest_DE',
          'sde_fsm': {
            'Form_BusinessUnit': 'MPR',
            'Form_FormName': 'Current_AlexaSongRequest_Form',
            'Form_FirstName': '',
            'Form_LastName': '',
            'Form_Email_Address': '',
            'Form_PostalCode': ''
          },
          'fsm': {
            'Form_Opt_In_Source': 'MPR Current Engagement'
          },
          'sde': {
            'Form_Song_and_Artist_Name': ''
          }
        }
      }
    },
    RATE_A_SONG: {
      action: 'https://ratingapi.publicradio.org/users/',
      data: {
        ratable_type: 'the-current-song'
      }
    }
  },
  PODCASTS: [
    {
      'name': 'song of the day', // for identification in custom Podcast slot - value must be defined in skill interaction model
      'feedUrl': 'https://feeds.publicradio.org/public_feeds/song-of-the-day/rss/rss.rss',
      'behavior': null // FUTURE: Define podcast-specific behaviors like "serial" etc
    }
  ]
}
