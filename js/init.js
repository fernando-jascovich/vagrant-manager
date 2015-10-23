
const React = require('react');
const ReactDOM = require('react-dom');

const RefreshIndicator = require('material-ui/lib/refresh-indicator');
const Toggle = require('material-ui/lib/toggle');
const AppBar = require('material-ui/lib/app-bar');
const IconButton = require('material-ui/lib/icon-button');
const NavigationClose = require('material-ui/lib/svg-icons/navigation/close');

const ThemeManager = require('material-ui/lib/styles/theme-manager');
const MyRawTheme = require('./material-theme');

const ChildProcess = require('child_process');

var root, Layout, terminal, vagrants = [], loading = false;

function initLayout() {
  Layout = React.createClass({
    styles: {
      container: {
        height: "448px",
        overflow: "auto"
      },
      terminal: {
        backgroundColor: "#666666",
        color: "#ffffff",
        padding: "0 0.5em",
        height: "192px",
        overflow: "auto"
      }
    },
    childContextTypes : {
      muiTheme: React.PropTypes.object,
    },
    getChildContext() {
      return {
        muiTheme: ThemeManager.getMuiTheme(MyRawTheme),
      };
    },
    componentDidUpdate: function() {
      var t = document.getElementById("terminal");
      t.scrollTop = t.scrollHeight;
    },
    render: function() {
      return (
          <div>
            <div id="container" style={this.styles.container}>
              <AppBar title="Vagrant Manager"
                iconElementLeft={<IconButton>
                  <NavigationClose />
                </IconButton>} onClick={handleCloseClick} />
                <div style={{padding:"1em"}}>
                  {vagrants.map(function(result) {
                    var isOn = result[3] != "running";
                    var label = result[1]+" ("+result[2]+")";
                    return <Toggle key={result[0]} 
                      name={result[0]} 
                      label={label}
                      defaultToggled={!isOn}
                      style={{margin:"1em 0"}}
                      onToggle={toggleVagrant}
                      disabled={loading} />
                  })}
                </div>
            </div>
            <div id="terminal" style={this.styles.terminal}>
              <pre>{terminal}</pre>
            </div>
          </div>
      );
    }
  });
}

function handleCloseClick() {
  console.log("bye bye!");
  window.close();
}

function placeLoader() {
  ReactDOM.render(
    <RefreshIndicator size={40} left={140} top={300} status="loading" />,
    root
  );
}

function refreshLayout(data) {
  ReactDOM.render(<Layout />, root);
}

function queryVagrant() {
  var dataAccum = "";
  st = ChildProcess.spawn("vagrant", ["global-status"]);
  st.stdout.on("data", function(data) {
    dataAccum += data.toString();
    terminal = dataAccum;
    refreshLayout();
  });
  st.on("exit", function(code, signal) {
    if(code != null) {
      parseVagrantData(dataAccum);
    }
  });
}

function parseVagrantData(data) {
  var arr = data.substring(data.lastIndexOf("--"), data.indexOf("The") - 1)
    .replace("--", "")
    .replace(/(\r\n|\n|\r)/gm, "")
    .split(" ");
  arr = arr.filter(function(n) { 
    return n != undefined && n != ""
  }); 

  vagrants = [];
  for (i=0, j = arr.length; i < j; i+=5) {
    vagrants.push(arr.slice(i, i+5));
  }
  window.debug = vagrants;
  refreshLayout();
}

function toggleVagrant(e, toggled) {
  id = e.target.attributes.name.value;
  cmd = (!toggled) ? "halt" : "up";
  st = ChildProcess.spawn("vagrant", [cmd, id]);

  loading = true;
  terminal += "\n$ vagrant " + cmd + " " + id;
  refreshLayout();

  st.stdout.on("data", function(data) {
    terminal += "\n"+data.toString();
    refreshLayout();
  });
  st.on("exit", function(code, signal) {
    if(code != null) {
      loading = false;
      refreshLayout();
    }
  });
}

module.exports = {
  render: function(parentElement) {
    root = parentElement;
    initLayout();
    placeLoader();
    queryVagrant();
  }
}

