function sync(current_time, ts_tag_array) {
	for (var i=0; i<ts_tag_array.length; i++) {
		if ((current_time >= parseFloat(ts_start_time_array[i])) && (current_time <= parseFloat(ts_stop_time_array[i]))) {
			ts_tag_array[i].style.color = "red";
		}
	}
}

window.onload = function() {
	media = document.getElementById("player");
	
	var ts_tag_array = [];

	media.setAttribute("ontimeupdate", "sync(this.currentTime, ts_tag_array)");
    media.setAttribute("onmousemove", "sync(this.currentTime, ts_tag_array)");
    media.setAttribute("onclick", "sync(this.currentTime, ts_tag_array)");

    var ts_tag_array = document.getElementsByClassName("labeledTimeBlock");
    var ts_start_time_array = [];
    var ts_stop_time_array = [];

    for (var i = 0; i < ts_tag_array.length; i++) {
        ts_start_time_array[i] = ts_tag_array[i].getAttribute("data-start_time");
        ts_stop_time_array[i] = ts_tag_array[i].getAttribute("data-end_time");
    }
}