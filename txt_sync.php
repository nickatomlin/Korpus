<?php

	$media_file = "test1.mp4"; //Must be .mp3 (MPEG-1 and/or MPEG-2 Audio Layer III) audio, or .mp4 (H.264/MPEG-4) video
	$eaf_file = "test1.eaf";
	$player_title = "Ingi Cansecho Ande (intro)";

?>
<!DOCTYPE html>
<html>
<head>
	<title>ELAN Text Sync Tool: <?php echo $player_title; ?></title>
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<link rel="stylesheet" type="text/css" href="txt_sync.css">
</head>
<body>
<div id="txt_sync_content">
<?php
	
	/* add key-value pair ($id, $var) to $array. (php "arrays" are hashmaps). */
	function addArray(&$array, $id, $var)
	{
		$tempArray = array($var => $id);
		$array = array_merge($array, $tempArray);
	}
	
	function getSpeakerInitials($speaker)
	{
		$speaker_parts = explode(" ", $speaker);
		$spkr = "";
		foreach($speaker_parts as $sp_prt)
		{
			$spkr .= substr($sp_prt, 0, 1);
		}
		return $spkr;
	}
	
	$start_at_time = 0;
	$start_at_time_end = 0;
	$specific_start_line_id = "x0";

	$file_path = "elan_files/" . $eaf_file;
	
	echo "\n<h1>" . $player_title . "</h1>\n"; /* print page title */

	if (file_exists($file_path))
	{
		$xml = simplexml_load_file($file_path); 
		
		/* make time_slot_array a list of numerical timestamps (in ms?) */
		$time_slot_array = array();
		foreach ($xml->TIME_ORDER->TIME_SLOT as $time_slot)
		{
			$time_slot_array[] = $time_slot['TIME_VALUE'];
		}
		
		/* output_array will be a hashmap from times to ... */
		$output_array = array();
		
		$gloss_tier_string = "";
		
		$tier_count = 1; /* for generatig unique tier id's */
		
		/* tier_list will list initials and full name for each speaker */
		$tier_list = "\n<ol id=\"spkr_keys\">\n"; /* <ol> is "ordered list", with elements <li> "list item" */
				
		foreach ($xml->TIER as $a_tier)
		{	
			if(strtolower($a_tier['LINGUISTIC_TYPE_REF']) == "transcription")
			{	
				$speaker = $a_tier['PARTICIPANT'];
				$spkr = getSpeakerInitials($speaker);	
				
				$tier_css_id = "tr" . $tier_count++; /* unique tier id for use with css */
				
				$tier_list .= "<li><span class=\"spkr_key " . $tier_css_id . "\">" . $spkr . "</span><span> &middot; </span><span class=\"spkr_name\">" . $speaker . "</span></li>\n"; /* add speaker's initials and full name to tier_list */
				
				foreach ($a_tier->ANNOTATION as $a_nnotation)
				{
					/* xml format: <ANNOTATION> <ALIGNABLE_ANNOTATION ANNOTATION_ID="a1" TIME_SLOT_REF1="ts2" TIME_SLOT_REF2="ts4"> <ANNOTATION_VALUE> </ANNOTATION> */
					
					/* use TIME_SLOT_REF 's without "tr" prefix */
					$time_start_ref = (int) substr($a_nnotation->ALIGNABLE_ANNOTATION['TIME_SLOT_REF1'], 2); 
					$time_stop_ref = (int) substr($a_nnotation->ALIGNABLE_ANNOTATION['TIME_SLOT_REF2'], 2);
					
					$time_start_sec = $time_slot_array[$time_start_ref-1]/1000;
					$time_stop_sec = $time_slot_array[$time_stop_ref-1]/1000;
					// TODO make time_stop_sec larger so it doesn't cut off the end of the recording
					
					$line_id = $a_nnotation->ALIGNABLE_ANNOTATION['ANNOTATION_ID'];
					$line_out = htmlspecialchars($a_nnotation->ALIGNABLE_ANNOTATION->ANNOTATION_VALUE);
					
					/* Example resulting_span_string: <li class="txt_ln tr1" data-start="45.265" data-stop="47.146"> <span class="spkr">MC</span> <span> : </span> <span class="spkn" id="a1">Ingitangi a'indeccu'fa</span> </li>
					*/
					$resulting_span_string = "<li class=\"txt_ln " . $tier_css_id . "\" data-start=\"" . $time_start_sec . "\" data-stop=\"" . $time_stop_sec . "\"><span class=\"spkr\">" . $spkr . "</span><span> : </span><span class=\"spkn\" id=\"" . $line_id . "\">" . $line_out . "</span></li>\n";
					
					if ($line_id == $specific_start_line_id)
					{
						$start_at_time = $time_start_sec;
						$start_at_time_end = $time_stop_sec;
					}
					
					addArray($output_array, $time_start_ref, $resulting_span_string);
				}
			}
			
			if(strtolower($a_tier['LINGUISTIC_TYPE_REF']) == "gloss")
			{
				$speaker = $a_tier['PARTICIPANT'];	
				$spkr = getSpeakerInitials($speaker);
				
				foreach ($a_tier->ANNOTATION as $a_nnotation)
				{
					/* xml format: <ANNOTATION> <REF_ANNOTATION ANNOTATION_ID="a711" ANNOTATION_REF="a1"> <ANNOTATION_VALUE> </ANNOTATION> */
					
					/* print the div for this annotation, including its metadata */
					$line_ref = $a_nnotation->REF_ANNOTATION['ANNOTATION_REF'];
					$line_value = $a_nnotation->REF_ANNOTATION->ANNOTATION_VALUE;
					$line_out = htmlspecialchars($line_value);
					$spkr_out = $spkr;
					$gloss_tier_string .= "<div class=\"txt_ref\" id=\"r" . $line_ref . "\"><span class=\"spkr\">" . $spkr_out . "</span><span> : </span><span class=\"tran\">" . $line_out . "</span></div>\n";
				}
			}
		}
		
		$tier_list .= "</ol>\n";
		
		echo $tier_list;
		
		$media_type_tag = "audio";
		$media_mime_type = "audio/mpeg";
		$media_player_height = "";
		
		if (substr($media_file, -4) == ".mp4")
		{
			$media_type_tag = "video";
			$media_mime_type = "video/mp4";
			$media_player_height = " height=\"280\"";
		}
						
		echo "\n<div id=\"player_area\">";
		echo "\n<" . $media_type_tag . $media_player_height . " onclick=\"sync(this.currentTime)\" onmousemove=\"sync(this.currentTime)\" ontimeupdate=\"sync(this.currentTime)\" id=\"sync_player\" controls=\"controls\">";
		echo "\n<source src=\"media_files/" . $media_file . "\" type=\"" . $media_mime_type . "\">";
		echo "\n</" . $media_type_tag . ">";
		echo "\n</div>\n";
		
		asort($output_array);
		
		echo "\n<div id=\"txt_lns\">\n<ul>\n";
		foreach(array_keys($output_array) as $line)
		{		
			echo $line;
		}
		echo "</ul>\n</div>\n";
		
		if($gloss_tier_string != "")
		{
			echo "\n<div class=\"txt_ref_lang\">Gloss:</div>\n\n<div id=\"txt_refs\">\n";
			echo $gloss_tier_string;
			echo "</div>\n";
		}
		
	} 
	else { exit("Failed to open XML file"); }
?>

</div>

<script type="text/javascript">
	var initial_time = <?php echo $start_at_time; ?>;
	var initial_time_end = <?php echo $start_at_time_end; ?>;
</script>

<script type="text/javascript" src="txt_sync.js"></script>

</body>
</html>
