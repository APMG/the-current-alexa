import get from 'lodash.get'

export default function () {
  return {
    'RequestSongIntent': function () {
      let token = get(this, 'event.session.user.accessToken')

      if (!token) {
        this.emit(
          ':tellWithLinkAccountCard',
          'You need to link your APM account to this skill before you can request a song'
        )
      }

      this.emit(':tell', 'Sorry, this feature hasn\'t been fully implemented yet.')
    }
  }
}
