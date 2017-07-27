import { Sidebar } from './Sidebar/Sidebar.jsx';
import { CenterPanel } from './Display/CenterPanel.jsx';

// Spanish language UI
var speakersUiText = "Hablantes";
var tiersUiText = "Niveles mostradas";
var videoButtonUiText = "Mostrar video";
var storyListUiText = "Lista de cuentos";
/*
// English language UI
var speakersUiText = "Speakers";
var tiersUiText = "Tiers to show";
var videoButtonUiText = "Show video";
var storyListUiText = "List of Stories";
*/

function App({ data }) {
	const sentences = data['sentences'];
	const timed = (data['metadata']['timed'] == 'true');
	let footer = null;
	if (timed) {
		let audioFile;
		const media = data['metadata']['media'];
		if ('mp3' in media) {
			audioFile = media['mp3'];
		} else {
			audioFile = media['mp4'];
		}
		footer = <audio data-live="true" controls id="audio" src={'data/media_files/' + audioFile} />;
	}
	return (
		<div>
			<div id="middle">
				<Sidebar metadata={data['metadata']} />
				<CenterPanel timed={timed} sentences={sentences} />
			</div>
			<div id="footer">{footer}</div>
		</div>
	);
}

$.getJSON('data/json_files/Intro.json', function(data) {
	ReactDOM.render(
		<App data={data} />,
		document.getElementById('main'),
		function() { 
			// If there is a footer, i.e., if audio exists:
			if ($('#footer').length !== 0) {
				$.ajax({
					url: './js/txt_sync.js',
					dataType: 'script'
				});

				// Resize elements based on footer height:
				var footheight = ($('#footer').height() + 48).toString() + 'px';
				var bodyheight = 'calc(100% - ' + footheight + ')';

				$('#leftPanel').css('width', '240px');
				$('#leftPanel').css('height', bodyheight);
				$('#centerPanel').css('height', bodyheight);
			}
		}
	);
});