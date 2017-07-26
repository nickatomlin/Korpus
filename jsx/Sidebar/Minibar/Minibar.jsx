import { Info } from './Info.jsx';
import { Search } from './Search.jsx';
import { Settings } from './Settings.jsx';

export function Minibar({ metadata, hasVideo }) {
	// I/P: metadata, in JSON format
	//      hasVideo, a boolean
	// O/P: a subsection of the sidebar with hide-able tabs
	// Status: untested, unwritten dependencies

	// Click events for the minibar subsections:
	$(document.body).on('click', '.minibarLink', function() {
		event.preventDefault(); // Prevents from following link.
		const activeLink = $('.nav-tabs > li.active > a').attr('href');

		// Find actived navigation and remove 'active' css
		const activeLI = $('.nav-tabs > li.active');
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
			<ul className="nav nav-tabs">
        		<li className="active"><a className="minibarLink" href="#info">Show Tab 1</a></li>
        		<li><a className="minibarLink" href="#search">Show Tab 2</a></li>
        		<li><a className="minibarLink" href="#settings">Show Tab 3</a></li>
    		</ul>
    		<Info metadata={metadata} />
    		<Search />
    		<Settings tiers={metadata['tier IDs']} hasVideo={hasVideo} />
		</div>
	);
}