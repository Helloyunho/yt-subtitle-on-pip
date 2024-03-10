let isPIPActive = document.pictureInPictureElement !== null

// FIXME: This is a hacky way to fix the vtt file
const fixSubtitleData = subtitleData => {
  const header = subtitleData
    .split('##\n')[0]
    .replace(/Kind: [a-z]+\n/, '')
    .replace(/Language: [a-z]+\n/, '')
    .replace(/Style:\n/, '\nSTYLE\n')

  const body = subtitleData.split('##\n').splice(1).join('##\n')
  return `${header}\n${body}`
}

const downloadAndCreateTrack = async ({ url, lang }) => {
  const subtitleData = await fetch(url).then(response => response.text())

  const fixedSubtitleData = fixSubtitleData(subtitleData)
  const blob = new Blob([fixedSubtitleData], { type: 'text/vtt' })

  const track = document.createElement('track')
  track.src = URL.createObjectURL(blob)
  track.kind = 'subtitles'
  track.srclang = lang.code
  track.label = lang.name
  track.default = true
  track.setAttribute('data-vss-id', lang.vssId)
  return track
}

const grabSubtitleURLAndLang = () => {
  const player = document.querySelector('ytd-watch-flexy').player
  const currentSubtitle = player.getOption('captions', 'track')
  if (!currentSubtitle) {
    return
  }
  const currentVssId = currentSubtitle.vss_id

  const playerResp = player.getPlayerResponse()
  const subtitleData =
    playerResp.captions.playerCaptionsTracklistRenderer.captionTracks.find(
      track => track.vssId === currentVssId
    )
  if (subtitleData) {
    const url = subtitleData.baseUrl
    const parsedURL = new URL(url)

    parsedURL.searchParams.set('fmt', 'vtt')
    return {
      url: parsedURL.href,
      lang: {
        code: subtitleData.languageCode,
        name: subtitleData.name.simpleText,
        vssId: subtitleData.vssId
      }
    }
  }
}

const removeAllTracks = () => {
  const player = document.querySelector('video')
  const tracks = player.querySelectorAll('track')
  tracks.forEach(track => track.remove())
}

const updateTrackToPlayer = async () => {
  if (!isPIPActive) {
    removeAllTracks()
    return
  }
  const subtitleData = grabSubtitleURLAndLang()
  const trackElement = document.querySelector('video > track')
  if (
    trackElement &&
    trackElement.getAttribute('data-vss-id') !== subtitleData?.lang.vssId
  ) {
    removeAllTracks()
  }
  if (
    !subtitleData ||
    trackElement?.getAttribute('data-vss-id') === subtitleData?.lang.vssId
  ) {
    return
  }

  const track = await downloadAndCreateTrack(subtitleData)
  const player = document.querySelector('video')
  if (!document.querySelector('video > track')) {
    player.appendChild(track)
  }
}

// FIXME: This is a hacky way to update the track when the user changes the subtitle
//        It would be better to listen to the event that changes the subtitle
document.querySelector('ytd-app').addEventListener('yt-action', () => {
  updateTrackToPlayer()
})

document.addEventListener('enterpictureinpicture', () => {
  isPIPActive = true
  updateTrackToPlayer()
})

document.addEventListener('leavepictureinpicture', () => {
  isPIPActive = false
  updateTrackToPlayer()
})
