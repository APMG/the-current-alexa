var podcaster = require('../src/podcaster')
var podcastFixture = require('./fixtures/podcast')

var mockEmit = jest.fn()
var mockReceivedOffset = 500

var mockResponse = {
  speak: jest.fn(function () { return this }),
  audioPlayerClearQueue: jest.fn(function () { return this }),
  audioPlayerPlay: jest.fn(function () { return this })
}

describe('Podcaster Test', function () {
  var handler

  it('resumes playing', function () {
    handler = getMockHandler()
    podcaster(handler).resume()
    expectPlayEpisodeAtIndex(handler, 0)
  })

  it('stops', function () {
    handler = getMockHandler()
    podcaster(handler).stop()
    expect(mockResponse.audioPlayerClearQueue).toHaveBeenCalledWith('CLEAR_ALL')
    expect(mockEmit).toHaveBeenCalledWith(':responseReady')
    // let targetEp = episodeAtIndex(handler, 0)
    // expect(targetEp.playtime).toEqual(mockReceivedOffset)
  })

  it('starts episode over', function () {
    handler = getMockHandler()
    podcaster(handler).startOver()
    let targetEp = episodeAtIndex(handler, 0)
    let expectedPrevToken = getExpectedPrevTokenFromIndex(0)
    expectPlayEpisode(targetEp, 'REPLACE_ALL', expectedPrevToken)
    // expect(targetEp.playtime).toEqual(0)
  })

  it('plays podcast from start', function () {
    handler = getMockHandler()
    podcaster(handler).playPodcastFromStart()
    expectPlayEpisodeAtIndex(handler, 0)
  })

  it('plays the "next" episode', function () {
    handler = getMockHandler()
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/06/shout-out-louds-porcelain'
    podcaster(handler).next()
    expectPlayEpisodeAtIndex(handler, 1)
  })

  it('plays the "previous" episode', function () {
    handler = getMockHandler()
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/08/re-tros-at-mosp-here'
    podcaster(handler).previous()
    expectPlayEpisodeAtIndex(handler, 1)
  })

  it('resumes on playOrResume when an existing episode is present', function () {
    handler = getMockHandler()
    handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/06/shout-out-louds-porcelain'
    podcaster(handler).playOrResume()
    expectPlayEpisodeAtIndex(handler, 2)
  })

  it('plays from start on playOrResume when no existing episode is present', function () {
    handler = getMockHandler()
    delete handler.attributes.podcasts.data[0].currentEpisodeGuid
    podcaster(handler).playOrResume()
    expectPlayEpisodeAtIndex(handler, 0)
  })

  it('turns loop mode on', function () {
    handler = getMockHandler()
    handler.attributes.podcasts.isLooping = false
    podcaster(handler).turnLoopModeOn()
    expect(handler.attributes.podcasts.isLooping).toEqual(true)
    expect(podcaster(handler).isLooping()).toEqual(true)
  })

  it('turns loop mode off', function () {
    handler = getMockHandler()
    handler.attributes.podcasts.isLooping = true
    podcaster(handler).turnLoopModeOff()
    expect(handler.attributes.podcasts.isLooping).toEqual(false)
    expect(podcaster(handler).isLooping()).toEqual(false)
  })

  // it('enqueues the next episode', function () {
  //   handler = getMockHandler()
  //   handler.attributes.podcasts.isLooping = false
  //   handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/06/shout-out-louds-porcelain'
  //   podcaster(handler).enqueueNext()
  //   expectPlayEpisodeAtIndex(handler, 3, 'REPLACE_ENQUEUED')
  // })

  // it('repeats the current podcast if looping is on', function () {
  //   handler = getMockHandler()
  //   handler.attributes.podcasts.data[0].currentEpisodeGuid = 'http://www.thecurrent.org/feature/2017/11/08/re-tros-at-mosp-here'
  //   podcaster(handler).turnLoopModeOn()
  //   podcaster(handler).enqueueNext()
  //   expectPlayEpisodeAtIndex(handler, 0, 'REPLACE_ENQUEUED')
  // })

  it('plays the latest episode', function () {
    handler = getMockHandler()
    podcaster(handler).playLatest()
    expectPlayEpisodeAtIndex(handler, 0)
  })

  it('sets the current podcast when it exists', function () {
    handler = getMockHandler()
    delete handler.attributes.podcasts.currentPodcastIndex
    podcaster(handler).setCurrentPodcast(podcastFixture)
    expect(handler.attributes.podcasts.currentPodcastIndex).toEqual(0)
  })
})

function episodeAtIndex (handler, index) {
  return handler.attributes.podcasts.data[0].episodes[index]
}

function expectPlayEpisodeAtIndex (handler, index, playBehavior) {
  let episode = episodeAtIndex(handler, index)
  let prevToken = getExpectedPrevTokenFromIndex(handler, index, playBehavior)
  expectPlayEpisode(episode, playBehavior, prevToken)
}

function expectPlayEpisode (episode, behavior, expectedPrev) {
  let expectedMsg = 'Now playing "' + episode.title + '" from ' + podcastFixture.title
  behavior = behavior || 'REPLACE_ALL'
  expect(mockResponse.speak).toHaveBeenCalledWith(expectedMsg)
  expect(mockResponse.audioPlayerPlay).toHaveBeenCalledWith(
    behavior,
    episode.enclosure.url,
    episode.guid,
    expectedPrev,
    0 //!!episode.playtime ? episode.playtime : 0
  )
  expect(mockEmit).toHaveBeenCalledWith(':responseReady')
}

function getExpectedPrevTokenFromIndex (handler, index, playBehavior) {
  if (!playBehavior || playBehavior === 'REPLACE_ALL') {
    return null
  } else {
    var prevEp = handler.attributes.podcasts.data[0].episodes[index + 1]
    return prevEp.guid || null
  }
}

function getMockHandler (override) {
  var mockHandler = Object.assign({}, {
    attributes: {
      podcasts: {
        currentPodcastIndex: 0,
        isLooping: false,
        data: [
          podcastFixture
        ]
      }
    },
    response: mockResponse,
    event: {
      request: {
        offsetInMilliseconds: mockReceivedOffset
      }
    },
    emit: mockEmit
  })
  return Object.assign({}, mockHandler, override)
}
