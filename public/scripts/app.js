$( document ).ready(function() {
  // Add offline service worker if possible
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/offline.worker.js")
  }

  // Set default time (prevents browser auto-fill/save)
  $('#time').val(60)

  var video = new Video(Storage.storedInput(), Storage.storedType())
  var timer = new Timer()

  // Button bind events
  $('#load').click(function() {
    if(video.createFrame()) {
      // only store on success
      Storage.storeData(video.vidID, video.vidType)
    }
  })
  $('#start').click(function() {
    timer.startTimer()
  })
  $('#stop').click(function() {
    timer.stopTimer()
  })
  $('#plus15').click(function() {
    timer.addTime(15)
  })
  $('#set30').click(function() {
    timer.setTime(30)
  })
  $('#set60').click(function() {
    timer.setTime(60)
  })
  $('#reset').click(function() {
    Storage.clearStorage()
    location.reload()
  })

})