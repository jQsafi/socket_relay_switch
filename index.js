const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const USBRelay = require("@josephdadams/usbrelay");
const { log } = require('console');
const relay = new USBRelay();
const port = process.env.PORT || 3000;
let relayTimer = [];
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
fs.readFile('config.json', 'utf8', (err, data) => {
	config = JSON.parse(data);
	//console.log(config);
});
io.on('connection', function(socket)
{
	relay.setState(0, false);
	socket.on('scanComplete', function(packageInfo)
	{
		clearTimeout(relayTimer);
		packageInfo = JSON.parse(packageInfo);
		deliveryZone = packageInfo.z;
		relayInfo = config[deliveryZone];
		relayController(relayInfo.relay, relayInfo.time,10);
		io.emit('scanComplete', deliveryZone);
	});
	socket.on('packageInfo', function(msg){
		io.emit('packageInfo',msg);
	});
  socket.on('disconnect', function() {
	clearTimeout(relayTimer);
    relay.setState(0, false);
  });
});
const relayController = async (relayIndex, timer, repeat) => {
	clearTimeout(relayTimer);
	for (i = 0; i <repeat; i++) {
		relayTimer = setTimeout(() => {
			if(relay.getState(relayIndex)) relay.setState(relayIndex, false);
			else relay.setState(relayIndex, true);
		}, i*timer);
		// clear{"i":2,"z":"DHK-B","m":"01xxxx"}
		Timeout(relayTimer);
	}
};
http.listen(port, function(){
  console.log('listening on *:' + port);
});