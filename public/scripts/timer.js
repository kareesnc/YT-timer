class Timer {
  constructor() {
    this.timeLeft = -999
    this.timer = undefined
  }

  setTime(time) {
    $('#time').val(time)
    // Only set the time left if the timer is running
    if(this.timer) {
      this.timeLeft = time
    }
  }

  addTime(time) {
    $('#time').val(parseInt($('#time').val())+time)
    // Only set the time left if the timer is running
    if(this.timer) {
      this.timeLeft += time*60;
    }
  }

  startTimer() {
    this.timeLeft = parseInt($('#time').val())*60
    // Only start the interval if it's currently stopped
    if(!this.timer) {
      const self = this
      this.timer = setInterval(function() {
        self.tick()
      },1000)
    }
  }

  stopTimer() {
    // Interval will be cleared on the next tick
    this.timeLeft = -999
  }

  tick() {
    if(this.timeLeft == -999) {
      $('#time_left').html('Timer stopped')
      clearInterval(this.timer)
      this.timer = undefined
      return
    }
    if(this.timeLeft <= 0) {
      $('#time_left').html('Timer ended')
      clearInterval(this.timer)
      this.timer = undefined
      return
    }

    // Display remaining time
    var hrsLeft = Math.floor(this.timeLeft/3600)
    var minsLeft = Math.floor(this.timeLeft/60)-hrsLeft*60
    var secsLeft = this.timeLeft%60
    if(secsLeft<10) {
      secsLeft = '0'+secsLeft
    }
    var timeText = minsLeft+':'+secsLeft+' remains'
    if(hrsLeft>0) {
      if(minsLeft<10) {
        timeText = hrsLeft+':0'+timeText
      }
      else {
        timeText = hrsLeft+':'+timeText
      }
    }
    $('#time_left').html(timeText)
  
    // Tick down
    this.timeLeft--
    
    // (once only) Destroy iFrame to ensure playback stops
    if(this.timeLeft <= 0) {
      setTimeout(function() {
        $('#video').html('')
      }, 1000)
    }
  }
}