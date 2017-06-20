var media;
var ts_tag_array = [];
var ts_start_time_array = [];
var ts_stop_time_array = [];
var number_of_lines;
var sub_time;

function set_time_play_and_pause(start_time, end_time)
{
	media.pause();
	clearTimeout(sub_time);
	play_time = Math.ceil((end_time - start_time) * 1000);
	media.currentTime = start_time;
	media.play();
	sub_time = setTimeout(function() { media.pause(); }, play_time);
}

function sync(current_time)
{
	var txt_lns_rect = document.getElementById("txt_lns").getBoundingClientRect();
	var mid_point = txt_lns_rect.top + ((txt_lns_rect.bottom - txt_lns_rect.top) / 2);
	var max_scroll = (document.getElementById("txt_lns").scrollHeight - 470); //470 is the height of the rectangle without its border
	var ref_id;
	
	for (i = 0; i < number_of_lines; i++)
	{
        if ((current_time >= parseFloat(ts_start_time_array[i])) && (current_time <= parseFloat(ts_stop_time_array[i])))
		{			
            ts_tag_array[i].setAttribute("id", "txt-current_" + i);
			
			while((document.getElementById("txt_lns").scrollTop < max_scroll) && ((ts_tag_array[i].getBoundingClientRect().top + ((ts_tag_array[i].getBoundingClientRect().bottom - ts_tag_array[i].getBoundingClientRect().top) / 2)) > mid_point) )
			{
				document.getElementById("txt_lns").scrollTop++;
			}
			
			ref_id = ts_tag_array[i].childNodes[2].getAttribute("id");
			if(document.getElementById("r" + ref_id))
			{
				document.getElementById("r" + ref_id).style.display = "block";
			} 
        }
        else
		{
            try { ts_tag_array[i].removeAttribute("id"); }
            catch (err) { }
			
			try
			{
				ref_id = ts_tag_array[i].childNodes[2].getAttribute("id");
				if(document.getElementById("r" + ref_id))
				{
					document.getElementById("r" + ref_id).style.display = "none";
				}
			}
			catch (err) { }
        }
    }
}

/* on page load */

window.onload = function()
{
	media = document.getElementById("sync_player");
	
	media.setAttribute("ontimeupdate", "sync(this.currentTime)");
    media.setAttribute("onmousemove", "sync(this.currentTime)");
    media.setAttribute("onclick", "sync(this.currentTime)");
    
    ts_tag_array = document.getElementsByClassName("txt_ln");
	
	number_of_lines = ts_tag_array.length;
	
    for (i = 0; i < number_of_lines; i++)
    {
        ts_start_time_array[i] = ts_tag_array[i].getAttribute("data-start");
        ts_stop_time_array[i] = ts_tag_array[i].getAttribute("data-stop");
        ts_tag_array[i].childNodes[0].setAttribute("onclick", "set_time_play_and_pause(" + ts_start_time_array[i] + ", " + ts_stop_time_array[i] + ")");
    }
		
	if (initial_time > 0)
	{
		try { set_time_play_and_pause(initial_time, initial_time_end); } 
		catch(error) { media.addEventListener("canplay", function() { set_time_play_and_pause(initial_time, initial_time_end); },true); }
	}
};
