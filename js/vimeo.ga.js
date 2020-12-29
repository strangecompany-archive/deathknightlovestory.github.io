/*!
 * vimeo.ga.js | v0.2
 * Copyright (c) 2012 - 2013 Sander Heilbron (http://sanderheilbron.nl)
 * MIT licensed
 * Added Support for Detecting ga.js or analytics.js to use proper tracking code for each - 11/6/2013 - Robert Waddell (http://mrrobwad.blogspot.com)
 */
 
$(function() {
    var f = $('iframe'),
        url = f.attr('src').split('?')[0],
        trackProgress = f.data('progress'), // Data attribute to enable progress tracking
        trackSeeking = f.data('seek'), // Data attribute to enable seek tracking
	splittest = f.attr('splittest'), 
		gatype = 0; // init the gatype variable

    // Listen for messages from the player
    if (window.addEventListener) {
        window.addEventListener('message', onMessageReceived, false);
    } else {
        window.attachEvent('onmessage', onMessageReceived, false);
    }

    // Handle messages received from the player
    function onMessageReceived(e) {
        if (e.origin !== "http://player.vimeo.com") {
			return;
        }
		
		if ( typeof(_gaq) != 'undefined' ) {
			gatype = 1; // ga.js
		} else if ( typeof(window.ga) != 'undefined' ) {
			gatype = 2; // analytics.js
		}

		if (gatype == 0) {
			return; // Google Analytics not found
		}
		
        var data = JSON.parse(e.data);

        switch (data.event) {
        case 'ready':
            onReady();
            break;

        case 'playProgress':
            onPlayProgress(data.data);
            break;

        case 'seek':
            if (trackSeeking && !videoSeeking) {
				if ( gatype == 1 ) {
					_gaq.push(['_trackEvent', 'Vimeo', 'Skipped video forward or backward', url, undefined, true]);
				} else if ( gatype == 2 ) {
					ga('send', 'event', 'Vimeo', 'Skipped video forward or backward', url);
				}
                videoSeeking = true; // Avoid subsequent seek trackings
            }
            break;

        case 'play':
            if (!videoPlayed) {
				if ( gatype == 1 ) {
					_gaq.push(['_trackEvent', 'Vimeo ' + splittest, 'Started video', url, undefined, true]);             
				} else if ( gatype == 2 ) {
					ga('send', 'event', 'VimeoTT', 'Started video', url);
				}
                videoPlayed = true; //  Avoid subsequent play trackings
            }
            break;

        case 'pause':
            onPause();
            break;

        case 'finish':
            if (!videoCompleted) {
				if ( gatype == 1 ) {
					_gaq.push(['_trackEvent', 'Vimeo ' + splittest, 'Completed video', url, undefined, true]);       
				} else if ( gatype == 2 ) {
					ga('send', 'event', 'Vimeo', 'Completed video', url);
				}
                videoCompleted = true; // Avoid subsequent finish trackings
            }
            break;
        }
    }

    // Helper function for sending a message to the player
    function post(action, value) {
        var data = {
            method: action
        };

        if (value) {
            data.value = value;
        }

        f[0].contentWindow.postMessage(JSON.stringify(data), url);
    }

    function onReady() {
        post('addEventListener', 'play');
        post('addEventListener', 'seek');
        post('addEventListener', 'pause');
        post('addEventListener', 'finish');
        post('addEventListener', 'playProgress');
        progress25 = false;
        progress50 = false;
        progress75 = false;
        videoPlayed = false;
        videoPaused = false;
        videoSeeking = false;
        videoCompleted = false;
    }
    
    function onPause() {
     if (timePercentComplete < 99 && !videoPaused) {
		if ( gatype == 1 ) {
			_gaq.push(['_trackEvent', 'Vimeo ' + splittest, 'Paused video', url, undefined, true]);
		} else if ( gatype == 2 ) {
			ga('send', 'event', 'Vimeo', 'Paused video', url);
		}
		videoPaused = true; // Avoid subsequent pause trackings
      }
     }

    // Tracking video progress 
    function onPlayProgress(data) {
        timePercentComplete = Math.round((data.percent) * 100); // Round to a whole number
        
        if (!trackProgress) {
         return;
        }
        
        var progress;
        
        if (timePercentComplete > 24 && !progress25) {
            progress = 'Played video: 25%';
            progress25 = true;
        }

        if (timePercentComplete > 49 && !progress50) {
            progress = 'Played video: 50%';
            progress50 = true;
        }

        if (timePercentComplete > 74 && !progress75) {
            progress = 'Played video: 75%';
            progress75 = true;
        }
        
        if (progress) {
			if ( gatype == 1 ) {
				_gaq.push(['_trackEvent', 'Vimeo ' + splittest, progress, url, undefined, true]);
			} else if ( gatype == 2 ) {
				ga('send', 'event', 'Vimeo', progress, url);
			}
        }
    }

});
