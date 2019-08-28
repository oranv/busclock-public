var dictionary = {
"Ucsb": "UCSB",
"Sb": "SB",
"Sbcc": "SBCC",
"Old Town Goleta - Camino Real Ma": "Camino Real Marketplace",
"Camino Real Mkt": "Camino Real Marketplace"
};

function replaceOnceUsingDictionary(dictionary, content, replacehandler) {
    if (typeof replacehandler != "function") {
        // Default replacehandler function.
        replacehandler = function(key, dictionary){
            return dictionary[key];
        }
    }

    var patterns = [], // \b is used to mark boundaries "foo" doesn't match food
        patternHash = {},
        oldkey, key, index = 0,
        output = [];
    for (key in dictionary) {
        // Case-insensitivity:
        key = (oldkey = key).toLowerCase();
        dictionary[key] = dictionary[oldkey];

        // Sanitize the key, and push it in the list
        patterns.push('\\b(?:' + key.replace(/([[^$.|?*+(){}])/g, '\\$1') + ')\\b');

        // Add entry to hash variable, for an optimized backtracking at the next loop
        patternHash[key] = index++;
    }
    var pattern = new RegExp(patterns.join('|'), 'gi'),
        lastIndex = 0;

    // We should actually test using !== null, but for foolproofness,
    //  we also reject empty strings
    while (key = pattern.exec(content)) {
        // Case-insensitivity
        key = key[0].toLowerCase();

        // Add to output buffer
        output.push(content.substring(lastIndex, pattern.lastIndex - key.length));
        // The next line is the actual replacement method
        output.push(replacehandler(key, dictionary));

        // Update lastIndex variable
        lastIndex = pattern.lastIndex;

        // Don't match again by removing the matched word, create new pattern
        patterns[patternHash[key]] = '^';
        pattern = new RegExp(patterns.join('|'), 'gi');

        // IMPORTANT: Update lastIndex property. Otherwise, enjoy an infinite loop
        pattern.lastIndex = lastIndex;
    }
    output.push(content.substring(lastIndex, content.length));
    return output.join('');
}


// Get parameters from URL
var GET = {};
var query = window.location.search.substring(1).split("&");
for (var i = 0, max = query.length; i < max; i++)
{
    if (query[i] === "") // check for trailing & with no param
        continue;

    var param = query[i].split("=");
    GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
}


// Prettify names
var prettify = function (str) {
	str = str.toLowerCase().split(' ');
	for (var i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
    
	return str.join(' ');
};


// Clock on display
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('clock').innerHTML = h + ":" + m + ":" + s;
    t = setTimeout(function () {
        startTime()
    }, 500);
}
startTime();


// Get data

const location_name = document.getElementById('location-name');
const prediction_list = document.getElementById('prediction-list');

const API_KEY = "<YOUR API KEY>";
const API_PROXY = "<PROXY URL>"
const API_PATH = API_PROXY + "https://bustracker.sbmtd.gov/bustime/api/v3/";
const STOPS = "278,279"; // 26,28,108,928 Storke & Hollister
const PRESETS = {
  cremona: "278,279",
  crm: "26,28,108,928",
  tc: "4"
}

const PRESET_NAMES = {
  cremona: "Office",
  crm: "Camino Real Marketplace",
  tc: "Transit Center"
}

if ("preset" in GET){
  var stops_param = PRESETS[GET["preset"]];
  location_name.textContent = PRESET_NAMES[GET["preset"]];
  }
else if ("stops" in GET){
  var stops_param = GET["stops"];
} else {
  var stops_param = STOPS;
}


function getPredictions() {
	while (prediction_list.firstChild) {
		prediction_list.removeChild(prediction_list.firstChild);
	}
	var request = new XMLHttpRequest();

	request.open('GET', API_PATH+'getpredictions'+'&key='+API_KEY+'&stpid='+stops_param+'&top=4&format=json', true );

	request.onload = function () {
		// Begin accessing JSON data here
		var data = JSON.parse(this.response);
	
	  if (request.status >= 200 && request.status < 400) {
      if (data["bustime-response"]["prd"]) {
        data["bustime-response"]["prd"].forEach(prediction => {
          const prediction_item = document.createElement('li');
          prediction_item.setAttribute('id', prediction.tatripid);
          prediction_item.setAttribute('class', 'bg-line-'+prediction.rt)
        
          const prd_p = document.createElement('p');
          prd_p.setAttribute('class', 'prd');
        
          const span_line = document.createElement('span');
          span_line.setAttribute('class', 'prd-line');
          span_line.textContent = prediction.rt.toLowerCase();
        
          const span_dest = document.createElement('span');
          span_dest.setAttribute('class', 'prd-direction');
          span_dest.textContent = replaceOnceUsingDictionary(dictionary, prettify(prediction.rtdir), function(key, dictionary){
        return ' ' + dictionary[key] + ' ';});
    
          const span_eta = document.createElement('span');
          span_eta.setAttribute('class', 'prd-eta');
        
          var prd_eta = "";
    
          if (parseInt(prediction.prdctdn, 10) > 15){
            prd_eta = prediction.prdtm.split(" ")[1];
          } else if (isNaN(parseInt(prediction.prdctdn, 10))){
            prd_eta = prediction.prdctdn.toLowerCase();
          } else {
            prd_eta = prediction.prdctdn+" min";
          }
          
          if (prediction.vid == ""){
          prd_eta = "*" + prd_eta; // scheduled time
          } else {
          prd_eta = prd_eta;
          }
          
          span_eta.textContent = prd_eta;
        
          prediction_list.appendChild(prediction_item);
        
          prediction_item.appendChild(prd_p);
        
          prd_p.appendChild(span_line);
          prd_p.appendChild(span_dest);
          prd_p.appendChild(span_eta);
          
        });
      } else if (data["bustime-response"]["error"]) {
        data["bustime-response"]["error"].forEach(error => {
          const error_item = document.createElement('li');
          error_item.setAttribute('id', error.stpid);
          error_item.setAttribute('class', 'bg-line-0')
        
          const err_p = document.createElement('p');
          err_p.setAttribute('class', 'prd');
        
          const span_line = document.createElement('span');
          span_line.setAttribute('class', 'prd-line');
          span_line.textContent = "";
        
          const span_dest = document.createElement('span');
          span_dest.setAttribute('class', 'prd-direction');
          span_dest.textContent = error.msg;

          const span_eta = document.createElement('span');
          span_eta.setAttribute('class', 'prd-eta');
          span_eta.textContent = "@" + error.stpid;

        
          prediction_list.appendChild(error_item);
        
          error_item.appendChild(err_p);
        
          err_p.appendChild(span_line);
          err_p.appendChild(span_dest);
          err_p.appendChild(span_eta);
          
      });
    }
	  } else {
		console.log('error');
	  }
	}

	// Send request
	request.send();
	}

getPredictions();
setInterval(getPredictions, 30*1000);