var got = require('got')
var parsePodcast = require('node-podcast-parser')

module.exports = function (handler) {
  if (!handler.attributes.podcasts) {
    handler.attributes.podcasts = {
      currentPodcastIndex: 0,
      isLooping: false,
      data: []
    }
  }

  return {
    stop: function () {
      // this._setCurrentTimeToRequestOffset()
      handler.response.audioPlayerClearQueue('CLEAR_ALL')
      handler.emit(':responseReady')
    },

    startOver: function () {
      this._updateEpisodePlaytime(0)
      var currentEpisode = this.getCurrentEpisode()
      this._play(currentEpisode)
    },

    playPodcastFromStart: function () {
      this._play(this.getCurrentPodcast().episodes[0])
    },

    resume: function () {
      var currentEpisode = this.getCurrentEpisode()
      this._play(currentEpisode)
    },

    playOrResume: function () {
      var currentEpisode = this.getCurrentEpisode()
      if (!currentEpisode || typeof currentEpisode === 'undefined') {
        this.playPodcastFromStart()
      } else {
        this.resume()
      }
    },

    turnLoopModeOn: function () {
      handler.attributes.podcasts.isLooping = true
      return this
    },

    turnLoopModeOff: function () {
      handler.attributes.podcasts.isLooping = false
      return this
    },

    isLooping: function () {
      return handler.attributes.podcasts.isLooping
    },

    next: function () {
      var nextEpisode = this._getNextEpisode()
      if (!nextEpisode || typeof nextEpisode === 'undefined') {
        handler.emit(':tell', 'Sorry, there is no "next" episode to play')
        return
      }
      this._play(nextEpisode)
    },

    previous: function () {
      var prevEpisode = this._getPreviousEpisode()
      if (!prevEpisode || typeof prevEpisode === 'undefined') {
        handler.emit(':tell', 'Sorry, there is no "previous" episode to play')
        return
      }
      this._play(prevEpisode)
    },

    playLatest: function () {
      var curEp = this.getCurrentPodcast()
      this._play(curEp.episodes[0])
    },

    enqueueNext: function () {
      if (handler.attributes.podcasts.isLooping) {
        this._loopCurrentEpisode()
      }
      var nextEp = this._getNextEpisode()
      if (nextEp && typeof nextEp !== 'undefined') {
        this._play(nextEp, 'REPLACE_ENQUEUED')
      }
    },

    getCurrentPodcast: function () {
      var curEpIndex = handler.attributes.podcasts.currentPodcastIndex
      return handler.attributes.podcasts.data[curEpIndex]
    },

    getCurrentEpisode: function () {
      var curPod = this.getCurrentPodcast()
      return curPod.episodes.find(function (episode) {
        return episode.guid === curPod.currentEpisodeGuid
      })
    },

    setCurrentPodcast: function (podcast) {
      var feedUrl = podcast.feedUrl
      var newCurrentPodcastIndex = handler.attributes.podcasts.data.map(function (pod) {
        return pod.feedUrl
      }).indexOf(feedUrl)

      if (!Number.isInteger(newCurrentPodcastIndex) || newCurrentPodcastIndex === -1) {
        var newLength = handler.attributes.podcasts.data.push({feedUrl: feedUrl})
        newCurrentPodcastIndex = newLength - 1
      }

      handler.attributes.podcasts.currentPodcastIndex = newCurrentPodcastIndex
      handler.attributes.podcasts.data[newCurrentPodcastIndex] = podcast
      return this
    },

    loadNewEpisodes: function () {
      return got(this.getCurrentPodcast().feedUrl)
        .then(
          this._loadNewEpisodesSuccess.bind(this),
          this._loadNewEpisodesFailure.bind(this)
        )
    },

    _play (episode, playBehavior) {
      // this._setCurrentEpisode(episode)
      handler.response.speak('Now playing "' + episode.title + '" from ' + this.getCurrentPodcast().title)
      handler.response.audioPlayerPlay(
        'REPLACE_ALL', // playBehavior || 'REPLACE_ALL', // replace all items in the queue with the current item
        episode.enclosure.url,
        episode.guid, // a token that uniquely identifies the track
        null, // this._getExpectedPreviousValue(playBehavior),
        0 // where in the track to begin playing from, in milliseconds
      )
      handler.emit(':responseReady')
    },

    _getCurrentEpisodeIndex () {
      var curPod = this.getCurrentPodcast()
      return curPod.episodes.map(function (ep) {
        return ep.guid
      }).indexOf(curPod.currentEpisodeGuid)
    },

    _getPreviousEpisode () {
      var currentEpIndex = this._getCurrentEpisodeIndex()
      var prevEpIndex = currentEpIndex + 1
      return this.getCurrentPodcast().episodes[prevEpIndex]
    },

    _getNextEpisode () {
      var currentEpIndex = this._getCurrentEpisodeIndex()
      var nextEpIndex = currentEpIndex - 1
      return this.getCurrentPodcast().episodes[nextEpIndex]
    },

    _loopCurrentEpisode () {
      var currentEpIndex = this._getCurrentEpisodeIndex()
      var curEp = Object.assign({}, this.getCurrentPodcast().episodes[currentEpIndex])
      // set playtime to 0 so that it doesn't
      // start playing from wherever the current
      // episode might have last been stopped / saved
      curEp.playtime = 0
      this._play(curEp, 'REPLACE_ENQUEUED')
    },

    _setCurrentTimeToRequestOffset () {
      var newTime = handler.event.request.offsetInMilliseconds
      this._updateEpisodePlaytime(newTime)
    },

    _updateEpisodePlaytime (newTime) {
      // var currentPodcast = this.getCurrentPodcast()
      // var currentEpisode = this.getCurrentEpisode()
      // currentEpisode.playtime = newTime
      // currentPodcast.episodes[this._getCurrentEpisodeIndex()] = currentEpisode
      // this.setCurrentPodcast(currentPodcast)
    },

    _setCurrentEpisode (episode) {
      var curPodIndex = handler.attributes.podcasts.currentPodcastIndex
      handler.attributes.podcasts.data[curPodIndex].guid = episode.guid
    },

    _loadNewEpisodesFailure (err) {
      this.emit(':tell', 'Sorry, there was an error retrieving the podcast data')
      return false
    },

    _loadNewEpisodesSuccess (res) {
      var self = this
      parsePodcast(res.body, function (err, newPod) {
        if (err) {
          console.error(err)
          handler.emit(':tell', 'Sorry, there was an error reading the podcast data')
          return
        }
        var curPod = self.getCurrentPodcast()
        // var currentEps = curPod.episodes || []

        // newPod.episodes
        //   // find episodes that aren't already in the episode array
        //   .filter(function (loadedEp) {
        //     return !currentEps.find(function (curEp) {
        //       return loadedEp.guid === curEp.guid
        //     })
        //   })
        //   // one by one add them to the beginning of the episode array
        //   .reverse()
        //   .map(function (newEp) {
        //     currentEps.unshift(newEp)
        //   })

        var loadedPodcast = Object.assign({}, curPod, newPod)
        // loadedPodcast.episodes = currentEps
        loadedPodcast.lastLoad = Date.now()
        // store it on the handler
        self.setCurrentPodcast(loadedPodcast)
      })
      return true
    },

    _getExpectedPreviousValue (playBehavior) {
      // this value is not required
      // when play behavior is "REPLACE_ALL"
      // which happens to be our default
      if (!playBehavior || playBehavior === 'REPLACE_ALL') {
        return null
      }

      var prevEp = this._getPreviousEpisode()

      if (prevEp && typeof prevEp !== 'undefined') {
        return prevEp.guid
      } else {
        return null
      }
    },

    _recordCurrentEpisodePlayed () {
      var currentEp = this.getCurrentEpisode()
      var currentPod = this.getCurrentPodcast()
      var currentPodIndex = handler.attributes.podcasts.currentPodcastIndex
      var playRecord = currentPod.playRecord || []

      playRecord.push(currentEp.guid)
      handler.attributes.podcasts.data[currentPodIndex].playRecord = playRecord
    }
  }
}
