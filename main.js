var app = require('app'); 
var BrowserWindow = require('browser-window');

var mainWindow = null;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    "width": 320, 
    "height": 640,
    "auto-hide-menu-bar": true
  });
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  //mainWindow.openDevTools();
});
