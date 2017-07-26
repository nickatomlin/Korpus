export function Minibar({ metadata, hasVideo }) {
	// I/P: metadata, in JSON format
	//      hasVideo, a boolean
	// O/P: a subsection of the sidebar with hide-able tabs
	// Status: untested, unwritten dependencies
	return (
		<div>
			<ul class="nav nav-tabs">
        		<li class="active"><a href="#info">Show Tab 1</a></li>
        		<li><a href="#search">Show Tab 2</a></li>
        		<li><a href="#settings">Show Tab 3</a></li>
    		</ul>
    		<Info metadata={metadata} />
    		<Search />
    		<Settings hasVideo={hasVideo} />
		</div>
	);
}