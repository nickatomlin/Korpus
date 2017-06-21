# Korpus
For presentation of audio/video/text corpus of Kofan texts. Borrowing code from [ETST](http://community.village.virginia.edu/etst/).

Contributors:
 - Nicholas Tomlin
 - Justin Bai
 - Kalinda Pride

## Setup for ETST with a PHP server
 - install XAMPP (or MAMP) (if it asks for firewall permissions to private or public networks, no need to give them)
 - extract elan_text_sync_tool.zip to xampp/httools/ETST (xampp/httools should already exist after installing xampp); on Mac, this should be placed in MAMP/htdocs
 - run XAMPP's Apache server
 - in a browser URL bar, type localhost/ETST and hit enter
 - click on the .php file
 - you should see the sample video with glosses/transcript

## Using your own ELAN files
### Changes to `txt_sync.php`
To run any ELAN file, edit the `txt_sync.php` file and edit the following lines:
~~~~
<?php
	$media_file = "Media_file_name.mp4"; // Must be .mp3 audio, or .mp4 video
	$eaf_file = "ELAN_file_name.eaf";
	$player_title = "Title of the page goes here";
?>
~~~~
### Editing your ELAN file to work
However, ELAN files need the correct tier types to work with the initial ETST. As you can see from the following code snippets, the tiers must be of type 'transcription' and 'gloss' to work correctly:
~~~~
foreach ($xml->TIER as $a_tier)
{
	if(strtolower($a_tier['LINGUISTIC_TYPE_REF']) == "transcription")
~~~~
~~~~
	if(strtolower($a_tier['LINGUISTIC_TYPE_REF']) == "gloss")
~~~~
Therefore, to make this work with any ELAN file, add the correct tier types and then edit the tiers in your file. Any tiers that aren't type "transcription" or "gloss" will be ignored. 

### Working with Incomplete Data
If there is no "gloss" tier, it will still work but there will be no glosses. If there is no media file (audio or video) to go with the ELAN file, it will report an error, but the text and glosses will still work. 
