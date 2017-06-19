# Korpus
For presentation of audio/video/text corpus of Kofan texts.

Contributors:
 - Nicholas Tomlin
 - Justin Bai
 - Kalinda Pride

How to set up ETST on your own machine:
 - install XAMPP (or MAMP) (if it asks for firewall permissions to private or public networks, no need to give them)
 - extract elan_text_sync_tool.zip to xampp/httools/ETST (xampp/httools should already exist after installing xampp); on Mac, this should be placed in MAMP/htdocs
 - run XAMPP's Apache server
 - in a browser URL bar, type localhost/ETST and hit enter
 - click on the .php file
 - you should see the sample video with glosses/transcript

To run any ELAN file, edit the `txt_sync.php` file and edit the following lines:
~~~~
<?php
	$media_file = "Media_file_name.mp4"; // Must be .mp3 audio, or .mp4 video
	$eaf_file = "ELAN_file_name.eaf";
	$player_title = "Title of the page goes here";
?>
~~~~
