// regexes
const youtubeVideo = /^(?:https\:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)(\w+)(?:\?.+|&.+)?$/;
// https://youtube.com/playlist?list=PLewsLItNcQsGdA2aQFjm8SW_t5q8GE1IO
// https://www.youtube.com/watch?v=vQVeaIHWWck&list=PLewsLItNcQsGdA2aQFjm8SW_t5q8GE1IO

// https://www.twitch.tv/videos/1240569639?t=13h02m54s
// https://www.twitch.tv/360chrism/v/1240569639?sr=a&t=46974s
// https://www.twitch.tv/bananaslamjamma

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
    // TODO
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
        alert('This feature is not ready. Please use a specific mode.');
        return;
        var result = autoDetectURL(input);
        if(!result && !result.selfURL && !result.embedURL) {
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
    // Load a YouTube playlist (TODO: accept list index?)
    if(searchParams.has('yp')) {
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