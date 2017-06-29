function sync(current_time) {
	console.log(current_time);
	for (var i=0; i<ts_tag_array.length; i++) {
		if ((current_time >= parseFloat(ts_start_time_array[i])/1000.0) && (current_time <= parseFloat(ts_stop_time_array[i])/1000.0)) {
			ts_tag_array[i].style.backgroundColor = "rgba(76, 175, 80, 0.3)";
		}
		else {
			ts_tag_array[i].style.backgroundColor = "white";
		}
	}
}

window.onload = function() {
	media = document.getElementById("player");

    media.setAttribute("ontimeupdate", "sync(this.currentTime)");
    media.setAttribute("onmousemove", "sync(this.currentTime)");
    media.setAttribute("onclick", "sync(this.currentTime)");

    ts_tag_array = document.getElementsByClassName("labeledTimeBlock");
    console.log(ts_tag_array);
    ts_start_time_array = [];
    ts_stop_time_array = [];

    for (var i = 0; i < ts_tag_array.length; i++) {
        ts_start_time_array[i] = ts_tag_array[i].getAttribute("data-start_time");
        ts_stop_time_array[i] = ts_tag_array[i].getAttribute("data-end_time");
    }
}