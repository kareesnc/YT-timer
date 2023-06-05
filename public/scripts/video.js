class Video {

  // available video types
  static AUTO_TYPE = 'auto'
  static YOUTUBE_VIDEO_TYPE = 'ytID'
  static YOUTUBE_PLAYLIST_TYPE = 'ytPL'
  static TWITCH_VIDEO_TYPE = 'twID'
  static TWITCH_CHANNEL_TYPE = 'twLC'

  constructor(vidID=undefined, vidType=undefined) {
    if(vidType && vidID) {
      this.vidType = vidType
      this.vidID = vidID
    }
    else {
      this.vidType = Video.AUTO_TYPE
      this.vidID = ''
    }
    $('#'+this.vidType).prop('checked',true)
    $('#input').val(this.vidID)
  }

  static regexes = {
    youtubeVideo: /^(?:https\:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)(?:\?.+|&.+)?$/,
    youtubePlaylist: /^(?:https\:\/\/)?(?:www\.)?(?:youtube\.com\/)(?:playlist\?|watch\?v=\w+&)(?:list=)([\w-]+)(?:&index=)?(\d+)?(?:&.+)?$/,
    twitchVideo: /^(?:https\:\/\/)?(?:www\.)?(?:twitch\.tv\/)(?:videos\/|\w+\/v\/)(\d+)(?:\?.+)?$/,
    twitchChannel: /^(?:https\:\/\/)?(?:www\.)?(?:twitch\.tv\/)(\w+)(?:\?.+)?$/
  }

  static getEmbedBases() {
    // current URL is required for embedding Twitch properly
    const thisURL = new URL(window.location)
    return {
      youtube : 'https://www.youtube.com/embed/',
      twitch : 'https://player.twitch.tv/?autoplay=false&parent='+thisURL.hostname
    }
  }

  static iFrameHelpers = {
    start : '<iframe width="560" height="315" src="',
    end : '" frameborder="0" allow="accelerometer; gyroscope; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
  }

  getAutoEmbedURL() {
    if(!this.vidID) {
      console.warn('Tried to auto-detect an empty video ID')
      return
    }
    const embedBases = Video.getEmbedBases()
    var embedURL = ''
    var result
    // check input against the regexes - if result exists, relevant ID will be in index 1
    // need to check for YouTube playlist first, since some playlist URLs will also register as a video URL
    if(result = this.vidID.match(Video.regexes.youtubePlaylist)) {
        embedURL = embedBases.youtube+'?listType=playlist&list='+result[1]
        if(result.length > 2) {
          embedURL += '&index='+result[2]
        }
    }
    else if(result = this.vidID.match(Video.regexes.youtubeVideo)) {
        embedURL = embedBases.youtube+result[1]
    }
    else if(result = this.vidID.match(Video.regexes.twitchVideo)) {
        embedURL = embedBases.twitch+'&video='+result[1]
    }
    else if(result = this.vidID.match(Video.regexes.twitchChannel)) {
        embedURL = embedBases.twitch+'&channel='+result[1]
    }
    else {
        alert('Unknown URL format.')
        return
    }
    return embedURL
  }

  // returns false on error, true if embed is successful
  createFrame() {
    this.vidID = $('#input').val()
    this.vidType = $('input[name="type"]:checked').prop('id')
    var embedURL = ''
    const embedBases = Video.getEmbedBases()

    if(!this.vidID || !this.vidType) {
      console.warn('Tried to load video with empty ID or type')
      return false
    }

    switch(this.vidType) {
      case Video.AUTO_TYPE:
        embedURL = this.getAutoEmbedURL()
        break
      case Video.YOUTUBE_VIDEO_TYPE:
        if(this.vidID.match(/^[a-zA-Z0-9_-]+$/)) {
          embedURL = embedBases.youtube+this.vidID
        }
        else {
          alert('Invalid YouTube video ID')
        }
        break
      case Video.YOUTUBE_PLAYLIST_TYPE:
        if(this.vidID.match(/^[a-zA-Z0-9_-]+$/)) {
          embedURL = embedBases.youtube+'?listType=playlist&list='+this.vidID
        }
        else {
          alert('Invalid YouTube video ID')
        }
        break
      case Video.TWITCH_VIDEO_TYPE:
        if(this.vidID.match(/^\d+$/)) {
          embedURL = embedBases.twitch+'&video='+this.vidID
        }
        else {
          alert('Invalid Twitch video ID')
        }
        break
      case Video.TWITCH_CHANNEL_TYPE:
        if(this.vidID.match(/^[a-zA-Z0-9_-]+$/)) {
          embedURL = embedBases.twitch+'&channel='+this.vidID
        }
        else {
          alert('Invalid Twitch channel')
        }
        break
      default:
        alert('Unknown video type')
    }

    if(embedURL) {
      $('#video').html(Video.iFrameHelpers.start + embedURL + Video.iFrameHelpers.end)
      return true
    }
    return false
  }
}