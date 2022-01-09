// regexes
const youtubeVideo = /^(?:https\:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)(?:\?.+|&.+)?$/;
const youtubePlaylist = /^(?:https\:\/\/)?(?:www\.)?(?:youtube\.com\/)(?:playlist\?|watch\?v=\w+&)(?:list=)([\w-]+)(?:&.+)?$/;
const twitchVideo = /^(?:https\:\/\/)?(?:www\.)?(?:twitch\.tv\/)(?:videos\/|\w+\/v\/)(\d+)(?:\?.+)?$/;
const twitchChannel = /^(?:https\:\/\/)?(?:www\.)?(?:twitch\.tv\/)(\w+)(?:\?.+)?$/;

// URLs
const thisURL = new URL(window.location);
const youtubeEmbedBase = 'https://www.youtube.com/embed/';
const twitchEmbedBase = 'https://player.twitch.tv/?autoplay=false&parent='+thisURL.hostname;

// init values
const defaultTime = 60;
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
    var embedURL = '';
    var result = null;
    // check input against the regexes - if result exists, relevant ID will be in index 1
    // need to check for YouTube playlist first, since some playlist URLs will also register as a video URL
    if(result = input.match(youtubePlaylist)) {
        selfURL += '?yp='+result[1];
        embedURL = youtubeEmbedBase+'?listType=playlist&list='+result[1];
        // TODO: can the embed URL include a video ID as well, to start at that video?
        // if so, consider altering the regex to capture the video ID optionally
        // (may need to detect length of result in that case)
    }
    else if(result = input.match(youtubeVideo)) {
        selfURL += '?yt='+result[1];
        embedURL = youtubeEmbedBase+result[1];
    }
    else if(result = input.match(twitchVideo)) {
        selfURL += '?tv='+result[1];
        embedURL = twitchEmbedBase+'&video='+result[1];
    }
    else if(result = input.match(twitchChannel)) {
        selfURL += '?tc='+result[1];
        embedURL = twitchEmbedBase+'&channel='+result[1];
    }
    else {
        alert('Unknown URL format.');
        return;
    }
    return {
        selfURL: selfURL,
        embedURL: embedURL
    };
}

// interprets the value in the main input based on the radio selection,
// then creates and embeds the iFrame to load the selected media
function createFrame() {
    var input = $('#input').val();
    var selfURL = getBaseSelfURL();
    var embedURL = '';

    if(!input) {
        return;
    }
    if($('#auto').prop('checked')) {
        var result = autoDetectURL(input);
        if(!result || !result.selfURL || !result.embedURL) {
            return;
        }
        selfURL = result.selfURL;
        embedURL = result.embedURL;
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

// tick down the timer every second, and clear the iframe on finish
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

// main function: load a URL-saved video state, attach button events
$( document ).ready(function() {
    // Load a GET-defined YouTube URL, if it exists
    var searchParams = new URLSearchParams(window.location.search);
    if(searchParams.has('yt')) {
        $('#input').val(searchParams.get('yt'));
        $('#ytID').prop('checked',true);
    }
    // Load a YouTube playlist
    else if(searchParams.has('yp')) {
        $('#input').val(searchParams.get('yp'));
        $('#ytPL').prop('checked',true);
    }
    // Load a Twitch video
    else if(searchParams.has('tv')) {
        $('#input').val(searchParams.get('tv'));
        $('#twID').prop('checked',true);
    }
    // Load a live Twitch channel
    else if(searchParams.has('tc')) {
        $('#input').val(searchParams.get('tc'));
        $('#twLC').prop('checked',true);
    }
    else {
        $('#input').val(searchParams.get(''));
        $('#auto').prop('checked',true);
    }
    // Set default time & instructions (setting time prevents browser auto-fill/save)
    $('#time').val(defaultTime);
    $('#time_left').html(initText);

    // Button bind events
    $('#load').click(function() {
        createFrame();
    });

    $('#reset').click(function() {
        timeLeft = -999;
        $('#time').val(defaultTime);
        $('#time_left').html(initText);
        $('#input').val('');
        $('#auto').prop('checked',true);
        $('#video').html('');
        history.pushState({}, null, getBaseSelfURL());
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