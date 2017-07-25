class Video extends React.Component {
	// I/P: path, the path to the video
	//		default, a boolean value (whether the video should appear on pageload or not)
	// O/P: a video player
	// Status: re-written, untested
	render() {
		if (default) {
			// Video shown (paused) on page-load
			// 	className='player' - used for time-aligned syncing
			return <video src={path} id="video" className="player" controls />;
		} else {
			// Video hidden on page-load
			// 	className='hidden' - used by CSS, for display: none
			return <video src={path} id="video" className="hidden" controls />;
		}
	}

	show() {
		// Resize panels:
		$('#leftPanel').css('width', '40%');
		$('#leftPanel').css('height', 'calc(100% - 48px)');
		$('#centerPanel').css('margin-left', '40%');
		$('#centerPanel').css('height', 'calc(100% - 48px)');
		$("#centerPanel").css("width", "60%");

		// Deactivate audio:
		$('#footer').css('display', 'none');
		$('#audio').removeAttr('ontimeupdate');
		$('#audio').removeAttr('onclick');
		$('#audio').attr('data-live', 'false');

		// Activate video:
		$('#video').css('display', 'inline');
		$('#video').attr('data-live', 'true');
		$('#video').attr('ontimeupdate', 'sync(this.currentTime)');
		$('#video').attr('onclick', 'sync(this.currentTime)');

		// Match times:
		var audio = document.getElementById('audio');
		var video = document.getElementById('video');
		if (!audio.paused) {
			audio.pause();
			video.play();
		}
		video.currentTime = audio.currentTime;
	}

	hide() {
		// Resize panels:
		var footheight = ($("#footer").height() + 48).toString() + "px";
		var bodyheight = "calc(100% - " + footheight + ")";

		$("#leftPanel").css("width", "240px");
		$("#leftPanel").css("height", bodyheight);
		$("#centerPanel").css("height", bodyheight);
		$("#centerPanel").css("margin-left", "240px");
		$("#centerPanel").css("width", "calc(100% - 240px)");

		// Deactivate video:
		$("#video").css("display", "none");
		$("#video").removeAttr("onclick");
		$("#video").removeAttr("ontimeupdate");
		$("#video").attr("data-live", "false");

		// Activate audio:
		$("#footer").css("display", "block");
		$("#audio").attr("data-live", "true");
		$("#audio").attr("ontimeupdate", "sync(this.currentTime)");
		$("#audio").attr("onclick", "sync(this.currentTime)");

		// Match times:
		var audio = document.getElementById("audio");
		var video = document.getElementById("video");
		if (!video.paused) {
			video.pause();
			audio.play();
		}
		audio.currentTime = video.currentTime;
	}
}