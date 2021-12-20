// regexes
const youtubeShare = /^https:\/\/youtu\.be\/.+$/;
const youtubeFull = /^https:\/\/youtube\.com\/watch\?v=$/;
const youtubePlaylistShare = /^$/;
const youtubePlaylistFull = /^$/;
const twitchVidDesktop = /^https:\/\/www\.twitch\.tv\/videos\/.+$/;
const twitchVidMobile = /^https:\/\/www\.twitch\.tv\/[a-zA-Z0-9_-]+\/v\/.+$/;
const twitchChannel = /^https:\/\/www\.twitch\.tv\/[a-zA-Z0-9_-]+$/;

// base URLs
const thisURL = new URL(window.location);
const youtubeEmbedBase = 'https://www.youtube.com/embed/';
const twitchEmbedBase = 'https://player.twitch.tv/?autoplay=false&parent='+thisURL.hostname;
const youtubeInputVideo = 'https://youtu.be/';
const youtubeInputPlaylist = 'https://youtube.com/playlist?list=';
const twitchInputVideo = 'https://www.twitch.tv/videos/';
const twitchInputChannel = 'https://www.twitch.tv/';

// init values
const initText = 'Load a video, then click start.';
const iframeStart = '<iframe width="560" height="315" src="';
const iframeEnd = '" frameborder="0" allow="accelerometer; gyroscope; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
var timeLeft = -999;
var timer = null;

// returns the base self app URL, for adding type/ID info to
function getBaseSelfURL() {
    return thisURL.origin+thisURL.pathname;
}

// returns an object containing the new self URL (for reload persistance) and the calculated embed url
// { selfURL: <new self url with type/ID>, embedURL: <embeddable YoutTube/Twitch URL> }
function autoDetectURL(input) {
    var selfURL = getBaseSelfURL();
    if(input.match(youtubeShare)) {
        input = 'TODO';
        selfURL += '?yt='+input;
        embedURL = youtubeEmbedBase+input;
    }
    else if(input.match(youtubeFull)) {
        input = 'TODO';
        selfURL += '?yt='+input;
        embedURL = youtubeEmbedBase+input;
    }
    else if(input.match(youtubePlaylistShare)) {
        input = 'TODO';
        selfURL += '?yp='+input;
        embedURL = youtubeEmbedBase+input;
    }
    else if(input.match(youtubePlaylistFull)) {
        input = 'TODO';
        selfURL += '?yp='+input;
        embedURL = youtubeEmbedBase+input;
    }
    else if(input.match(twitchVidDesktop)) {
        input = 'TODO';
        selfURL += '?tv='+input;
        embedURL = twitchEmbedBase+'&video='+input;
    }
    else if(input.match(twitchVidMobile)) {
        input = 'TODO';
        selfURL += '?tv='+input;
        embedURL = twitchEmbedBase+'&video='+input;
    }
    else if(input.match(twitchChannel)) {
        input = 'TODO';
        selfURL += '?tc='+input;
        embedURL = twitchEmbedBase+'&channel='+input;
    }
    else {
        alert('Unrecognized URL format');
        return null;
    }
    return {
        selfURL: selfURL,
        embedURL: embedURL
    };
}

function loadFrame() {
    var input = $('#input').val();
    var selfURL = getBaseSelfURL();
    var embedURL = '';

    if(!input) {
        return;
    }
    if($('#auto').prop('checked')) {
        alert('This feature is not ready. Please use a specific mode.');
        return;
        var result = autoDetectURL(input);
        if(!result) {
            return;
        }
    }
    else if($('#ytID').prop('checked')) {
        if(input.match(/^[a-zA-Z0-9_-]+$/)) {
            selfURL += '?yt='+input;
            embedURL = youtubeEmbedBase+input;
        }
        else {
            alert('Invalid YouTube video ID');
            return;
        }
    }
    else if($('#ytPL').prop('checked')) {
        if(input.match(/^[a-zA-Z0-9_-]+$/)) {
            selfURL += '?yp='+input;
            embedURL = youtubeEmbedBase+'?listType=playlist&list='+input;
        }
        else {
            alert('Invalid YouTube video ID');
            return;
        }
    }
    else if($('#twID').prop('checked')) {
        if(input.match(/^\d+$/)) {
            selfURL += '?tv='+input;
            embedURL = twitchEmbedBase+'&video='+input;
        }
        else {
            alert('Invalid Twitch video ID');
            return;
        }
    }
    else if($('#twLC').prop('checked')) {
        if(input.match(/^[a-zA-Z0-9_-]+$/)) {
            selfURL += '?tc='+input;
            embedURL = twitchEmbedBase+'&channel='+input;
        }
        else {
            alert('Invalid Twitch channel');
            return;
        }
    }
    else {
        alert('Unexpected radio selection');
        return;
    }

    if(embedURL) {
        history.pushState({}, null, selfURL);
        $('#video').html(iframeStart+embedURL+iframeEnd);
    }
}

function tick() {
    if(timeLeft == -999) {
        $('#time_left').html('Timer stopped');
        clearInterval(timer);
        timer = null;
        return;
    }
    if(timeLeft <= 0) {
        $('#time_left').html('Timer ended');
        clearInterval(timer);
        timer = null;
        return;
    }
    
    // Tick down
    var hrsLeft = Math.floor(timeLeft/3600);
    var minsLeft = Math.floor(timeLeft/60)-hrsLeft*60;
    var secsLeft = timeLeft%60;
    if(secsLeft<10) {
        secsLeft = '0'+secsLeft;
    }
    var timeText = minsLeft+':'+secsLeft+' remains';
    if(hrsLeft>0) {
        if(minsLeft<10) {
            timeText = hrsLeft+':0'+timeText;
        }
        else {
            timeText = hrsLeft+':'+timeText;
        }
    }
    $('#time_left').html(timeText);
    timeLeft--;
    
    // (once only) Destroy iFrame to ensure playback stops
    if(timeLeft <= 0) {
        setTimeout(function() {
            $('#video').html('');
        }, 1000);
    }
}

// reset everything: time, inputs, base URL
// set pushState to also reset the self URL
function reset(pushState) {
    timeLeft = -999;
    $('#auto').prop('checked',true);
    $('#input').val('');
    $('#time').val(60);
    $('#time_left').html(initText);
    $('#video').html('');
    if(pushState) {
        history.pushState({}, null, getBaseSelfURL());
    }
}

$( document ).ready(function() {
    // Load a GET-defined YouTube URL, if it exists
    var searchParams = new URLSearchParams(window.location.search);
    var inputVal = '';
    if(searchParams.has('yt')) {
        inputVal = youtubeInputVideo+searchParams.get('yt');
    }
    // Load a YouTube playlist (TODO: accept list index?)
    if(searchParams.has('yp')) {
        inputVal = youtubeInputPlaylist+searchParams.get('yp');
    }
    // Load a Twitch video
    else if(searchParams.has('tv')) {
        inputVal = twitchInputVideo+searchParams.get('tv');
    }
    // Load a live Twitch channel
    else if(searchParams.has('tc')) {
        inputVal = twitchInputChannel+searchParams.get('tc');
    }
    // Reset everything to prevent browser input saving
    reset(false);
    $('#input').val(inputVal);

    // Button bind events
    $('#load').click(function() {
        loadFrame();
    });

    $('#reset').click(function() {
        reset(true);
    });

    $('#start').click(function() {
        timeLeft = parseInt($('#time').val())*60;
        // Only start the interval if it's currently stopped
        if(!timer) {
            timer = setInterval(tick,1000);
        }
    });

    $('#stop').click(function() {
        // Interval will be cleared on the next tick
        timeLeft = -999;
    });

    $('#plus15').click(function() {
        // always add to the time in the input
        $('#time').val(parseInt($('#time').val())+15);
        // only add to the time left if the timer is running
        if(timer) {
            timeLeft += 15*60;
        }
    });

    $('#set30').click(function() {
        // always set the time in the input
        $('#time').val(30);
        // only set the time left if the timer is running
        if(timer) {
            timeLeft = 30*60;
        }
    });

    $('#set60').click(function() {
        // always set the time in the input
        $('#time').val(60);
        // only set the time left if the timer is running
        if(timer) {
            timeLeft = 60*60;
        }
    });

    $('#time_left').html(initText);

});