let muulam = document.getElementById('muulam');
let padaani = document.getElementById('padaani');
let prevButton = document.getElementById('prevButton');
let nextButton = document.getElementById('nextButton');
let audioElement = document.getElementById('audio');
let contentElement = document.getElementById('content');
let spinnerElement = document.getElementById('spinner');
let numElement = document.getElementById('shlokaNum');
let wordButton = document.getElementById('wordButton');

let playbackRate = 0.8;

const slp1 = Sanscript.schemes.slp1;
const consonants = Object.keys(slp1.consonants).map(i => slp1.consonants[i])

let shlokaNum = '1.1.1';

const shlokas = new Map();
const prevShloka = new Map();
const nextShloka = new Map();

const searchParams = new URLSearchParams(window.location.search);
if(searchParams.has('shloka')) {
	shlokaNum = searchParams.get('shloka');
}

function showShloka(num) {
	let prev = null;
	let next = null;

	if(!shlokas.has(num) ) return;
	if(prevShloka.has(num)) {prev = prevShloka.get(num)};
	if(nextShloka.has(num)) {next = nextShloka.get(num)}

    let data = shlokas.get(num);
	let words = data.words;
	let text = words[0].shlokaH.replace('।', '।<br>');
	let table = createTable(words);

	if(table != '') {
		wordButton.classList.remove('invisible');
	} else {
		wordButton.classList.add('invisible');
	}

	muulam.innerHTML = text;
	muulam.dataset.prev = prev;
	muulam.dataset.next = next;
    numElement.innerHTML = Sanscript.t(num, 'slp1', 'devanagari');
	padaani.innerHTML = table;
	padaani.classList.add('invisible');

	audioElement.dataset.begin = data.begin;
	audioElement.dataset.duration = (data.end - data.begin);
	audioElement.src = data.audioUrl;

	if(prev == null) {
		prevButton.classList.add('invisible');
		prevButton.classList.remove('visible');
	} else {
		prevButton.classList.add('visible');
		prevButton.classList.remove('invisible');
	}
	if(next == null) {
		nextButton.classList.add('invisible');
		nextButton.classList.remove('visible');
	} else {
		nextButton.classList.add('visible');
		nextButton.classList.remove('invisible');
	}
}

function showNext() {
	let num = muulam.dataset.next;
	showShloka(num);
}

function showPrev() {
	let num = muulam.dataset.prev;
	showShloka(num);
}

function createTable(words) {
    let headers = ['पदम्', 'मूलशब्दः', 'लिङ्गम्', 'अन्तव्यवस्था', 'अर्थः'];
    let h = '';
    if(words.length > 1) {
		h += '<table class="table table-striped table-bordered">';
		h += '<thead class="thead-light">';
		headers.forEach( (item) => {h += '<th scope="row">' + item + '</th>'});
		words.forEach( (item) => {
			let word_slp1 = Sanscript.t(item.mUlashabdaH, 'devanagari', 'slp1');
			let antaH = word_slp1[word_slp1.length-1];
			if(consonants.includes(antaH)) { antaH += 'a'}
			antaH += 'kArAntaH';
			antaH = Sanscript.t(antaH, 'slp1', 'devanagari');
			h += '<tr><td>' + item.padam + '</td><td>' + item.mUlashabdaH + '</td>';
			h += '<td>' + item.lingam + '</td><td>' + antaH + '</td>';
			h += '<td>' + item.arthaH + '</td></tr>'
		});
    }

	return h;
}

function toggleWords(src) {
	if(padaani.classList.contains('invisible')) {
		padaani.classList.remove('invisible');
		src.innerHTML = 'श्लोकस्थानि पदानि गोपयतु';
	} else {
		padaani.classList.add('invisible');
		src.innerHTML = 'श्लोकस्थानि पदानि दर्शयतु';
	}
}

function playAudio() {
	let duration = audioElement.dataset.duration;

	audioElement.playbackRate = playbackRate;
	audioElement.currentTime = audioElement.dataset.begin;

	setTimeout( () => {audioElement.pause()}, (duration/playbackRate)*1000);
	audioElement.play();
}

function parseData(csv_data) {
	let num = '';
	let text = '';
	let words = [];

	csv_data.data.forEach( (item) => {
		if(item.num != '') {
			// New shloka starts
			if(num != '') {
				shlokas.set(num, {words: words});
				prevShloka.set(item.num, num);
				nextShloka.set(num, item.num);
			}
		    num = item.num;
		    text = item.shlokaH;
		    words = [item];
		} else {
			words.push(item);
		}
	});

	// Hacky technique :( - Need to move to promises
	Papa.parse(audioDataUrl, {
	    download: true,
	    header: true,
	    complete: parseAudioData,
	    skipEmptyLines: true
	});

}

function parseAudioData(csv_data) {
	let data = csv_data.data;
	data.forEach( (item) => {
		if(shlokas.has(item.shloka_num)) {
			let obj = shlokas.get(item.shloka_num);
			obj.text = item.text;
			obj.begin = item.begin;
			obj.end = item.end;
			obj.audioUrl = item.audio_url;
		}
	});
	//console.log(shlokas);
	ready();
}

function ready() {
    spinnerElement.classList.add('invisible');
	contentElement.classList.remove('invisible');

	showShloka(shlokaNum);

}

//let dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSam328UZJFE6ZzKMWVnL8koGcH9ZatuC8ktBsGVtn2C4DkHtwlZLZ_jlhVB1hY5ERjDvvH_kprD0vV/pub?gid=1065135109&single=true&output=csv";
let dataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRG3EzFj6zUUQ66Au2A_epe4An65hqrTRHDhSiqkaToTOX7-_WqUlGvZOXeeoIjincVNM-GKVksIVaZ/pub?gid=1300231771&single=true&output=csv";
let audioDataUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRG3EzFj6zUUQ66Au2A_epe4An65hqrTRHDhSiqkaToTOX7-_WqUlGvZOXeeoIjincVNM-GKVksIVaZ/pub?gid=1905525739&single=true&output=csv";

// Main code
{
    Papa.parse(dataUrl, {
          download: true,
          header: true,
          complete: parseData,
          skipEmptyLines: true
		  });
}