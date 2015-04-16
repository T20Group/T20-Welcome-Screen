// -----------------------------------------------------
// SENSOR INTENT HANDLING
// -----------------------------------------------------

var AgentAPI = function() {
  var API_URL = "http://127.0.0.1:8080/api";

  function sendToApi(endPoint, method, data, callback) {
    var oReq = new XMLHttpRequest();
    var url = API_URL + "/" + endPoint;
    if (!method || (typeof method == "function")) {
      var method = "GET";
    }
    oReq.open(method, url, true);
    oReq.setRequestHeader("Content-Type", "text/plain");
    oReq.onload = function(e) {
      var res = oReq.responseText;
      if (callback && (typeof callback == "function")) {
        callback(res);
      } else {
        $('#log').text("RES", res);
      }
    }
    oReq.send(data);
  }

  function startSensor(callback) {
    var data = {};
    data.intent_name = "au.com.sct.agent.plugins.sensors.START_PROXIMITY_SERVICE";
    sendToApi("intents", "POST", JSON.stringify(data), callback);
  }

  function pollSensor(callback) {
    sendToApi("intents", "GET", null, callback);
  }

  return {
    startSensor : startSensor,
    pollSensor: pollSensor
  }
};



//------------------------------------------

var POLL_INTERVAL = 400;
var SENSOR_FLUCTUATING_TIME = 5000;
var firstRun = true;

//INIT SENSOR API
var api = AgentAPI();
api.startSensor();


// TIMEOUT FUNCTION FOR SENSOR
function sensor_poll_timeout() {
	setTimeout(sensor_poll, POLL_INTERVAL);
}


// POLL THE SENSOR
function sensor_poll() {
  api.pollSensor( function(json) {
    //$('#log').text("polled..", json); 
    
    var intents = JSON.parse(json).intents;
    
    if(firstRun){
      //just clearout on the first run so we don't trigger from old messages.
      firstRun = false;
      return;
    } 

    for(var i=0; i < intents.length;i++) {
      if (intents[0].inrange) {
        // in range
        // $(document).trigger('touchstart');
        var d = intents[i].reading;
        clearTimeout(window.sensingMovementStillTimeout);
/*         $('#log').text("WE'RE IN RANGE ............ " + distance); */
        //startPlayer();
		
		$('#sonartext').prepend('intent ' +i+': '+d+'<br/>');
		// sensed someone within zone, send to game page
		if ( (d>0 && d<=60) && firstRun==false ) { 
			//window.location.href = "index-sonar-next.html";
			$('#sonartext').prepend('sensor '+i+' WITHIN range: '+d+' pause for 5 seconds<br/>');
			$('#touchme').animate(
				{ opacity: 1 }, 200
			);
			$('#msg-holder').animate(
				{opacity: .3}, 200
			);
			
		}
		

      } else {
        // miss
        window.sensingMovementStillTimeout = setTimeout(function(){
        	//$('#log').text("trigger a restart");
        	//restartPlayer();
        	
        	// do nothing
        	//$('#sonartext').prepend('sensing still time out<br/>');
        	
        	$('#touchme').animate(
				{opacity: 0}, 200
			);

        	$('#msg-holder').animate(
				{opacity: 1}, 200
			);
        	
        }, SENSOR_FLUCTUATING_TIME);

      }
    } 
  });
  sensor_poll_timeout();
}
 
 

// START THE TIMEOUT LOOP
sensor_poll_timeout(2000);
