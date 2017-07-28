import { Info } from './Info/Info.jsx';
import { Search } from './Search/Search.jsx';
import { Settings } from './Settings/Settings.jsx';

export function Minibar({ metadata, hasVideo }) {
	// I/P: metadata, in JSON format
	//      hasVideo, a boolean
	// O/P: a subsection of the sidebar with hide-able tabs
	// Status: untested, unwritten dependencies

	// Click events for the minibar subsections:
	$(document.body).on('click', '.minibarLink', function(event) {
		event.preventDefault(); // Prevents from following link.
		const activeLink = $('.minibarTabs > li.active > a').attr('href');

		// Find actived navigation and remove 'active' css
		const activeLI = $('.minibarTabs > li.active');
		activeLI.removeClass('active');

		// Add 'active' css into clicked navigation
		$(this).parents('li').addClass('active');

		// Hide displaying tab content
		$(activeLink).removeClass('active');
		$(activeLink).addClass('hide');

		// Show target tab content
		var newLink = $(this).attr('href');
		$(newLink).removeClass('hide');
		$(newLink).addClass('active');
	});

	return (
		<div id="minibar">
			<ul className="minibarTabs">
        		<li className="active"><a className="minibarLink" href="#info"><img src="./images/info.svg" /></a></li>
        		<li><a className="minibarLink" href="#search"><img src="./images/search.svg" /></a></li>
        		<li><a className="minibarLink" href="#settings"><img src="./images/settings.svg" /></a></li>
    		</ul>
    		<div id="miniPage">
	    		<Info metadata={metadata} />
	    		<Search />
	    		<Settings tiers={metadata['tier IDs']} hasVideo={hasVideo} />
	    	</div>
		</div>
	);
}