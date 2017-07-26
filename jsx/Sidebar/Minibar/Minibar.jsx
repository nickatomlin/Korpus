import { Info } from './Info.jsx';
import { Search } from './Search.jsx';
import { Settings } from './Settings.jsx';

export function Minibar({ metadata, hasVideo }) {
	// I/P: metadata, in JSON format
	//      hasVideo, a boolean
	// O/P: a subsection of the sidebar with hide-able tabs
	// Status: untested, unwritten dependencies
	$(document.body).on('click', '.minibarLink', function() {
		event.preventDefault();
		var active_tab_selector = $('.nav-tabs > li.active > a').attr('href');

		//find actived navigation and remove 'active' css
		var actived_nav = $('.nav-tabs > li.active');
		actived_nav.removeClass('active');

		//add 'active' css into clicked navigation
		$(this).parents('li').addClass('active');

		//hide displaying tab content
		$(active_tab_selector).removeClass('active');
		$(active_tab_selector).addClass('hide');

		//show target tab content
		var target_tab_selector = $(this).attr('href');
		$(target_tab_selector).removeClass('hide');
		$(target_tab_selector).addClass('active');
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