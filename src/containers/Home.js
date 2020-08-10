import React, { Component } from "react";
import Header from "../components/Header";
const { ipcRenderer } = require("electron");
import { Alert } from "rsuite";
import { Input } from "antd";
import { Link } from "react-router-dom";

export default class Home extends Component {
  state = {
    selected_button: "new_connection",
    validate_host: false,
    validate_port: false
  };

  componentDidMount = async () => {
    console.log("Return stored capabilities to Main file..");
    try {
      const capabilities = JSON.parse(window.localStorage.getItem("capabilities"));
      await ipcRenderer.send("CAPS", capabilities);
    } catch (error) {
      console.log(error);
      console.log("No caps stored");
    }
  };

  startServer = () => {
    if (!window.localStorage.getItem("hostname") && !window.localStorage.getItem("port")) {
      this.setState({ validate_host: true, validate_port: true });
      return Alert.warning("Please enter host & port.");
    } else if (!window.localStorage.getItem("hostname")) {
      this.setState({ validate_host: true });
      return Alert.warning("Please enter host.");
    } else if (!window.localStorage.getItem("port")) {
      this.setState({ validate_port: true });
      return Alert.warning("Please enter port.");
    } else {
      ipcRenderer.send("start_server", { host: window.localStorage.getItem("hostname"), port: Number(window.localStorage.getItem("port")), start_req: true });
      this.props.history.push("/session");
    }
  };

  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="home-body-container animated fadeIn">
          <div className="title-container">Welcome{window.localStorage.getItem("user_name") ? ` ${window.localStorage.getItem("user_name")}` : null}! It’s time to make the testing fast and easy</div>
          <div className="bottom-container">
            <div className="left-part">
              <div className="record-card-container">
                <div className="record-card-top">
                  <div className="record-card-top-logo" />
                  <div className="record-card-top-title">Record Testcases</div>
                </div>
                <div className="record-card-bottom">
                  <div className="button-container">
                    <div onClick={() => this.setState({ selected_button: "new_connection" })} className={"button " + (this.state.selected_button === "new_connection" ? "active" : "")}>
                      NEW CONNECTION
                    </div>
                    <div onClick={() => this.setState({ selected_button: "preset" })} className={"button " + (this.state.selected_button === "preset" ? "active" : "")}>
                      PRESET
                    </div>
                  </div>
                </div>
                <div className="conditional-body-container">
                  <div className="textbox-container">
                    <div className="textbox-title">Host</div>
                    <Input
                      autoFocus
                      type="text"
                      onChange={e => {
                        window.localStorage.setItem("hostname", e.target.value);
                        this.setState({ validate_host: false });
                      }}
                      value={window.localStorage.getItem("hostname")}
                      style={this.state.validate_host ? { borderColor: "red" } : {}}
                      onPressEnter={this.startServer}
                    />
                  </div>
                  <div className="textbox-container">
                    <div className="textbox-title">Port</div>
                    <Input
                      type="number"
                      onChange={e => {
                        window.localStorage.setItem("port", e.target.value);
                        this.setState({ validate_port: false });
                      }}
                      value={window.localStorage.getItem("port")}
                      style={this.state.validate_port ? { borderColor: "red" } : {}}
                      onPressEnter={this.startServer}
                    />
                  </div>
                  <div className="advance-container">
                    <div className="text">Advance Settings</div>
                    <div className="text">Save as Preset</div>
                  </div>
                  <div onClick={this.startServer} className="start-button-container" style={{ width: "100%" }}>
                    START SERVER <div className="logo" />
                  </div>
                </div>
              </div>
            </div>
            <div className="right-part">
              <div className="card-container testcase-card">
                <div className="card-top-part">
                  <div className="card-top-logo" />
                  <div className="card-top-title">Testcases</div>
                </div>
                <div className="card-bottom-part">
                  <div className="card-bottom-desc">View all the recorded test cases.</div>
                </div>
              </div>
              <Link to="/setting" className="card-container setting-card">
                <div className="card-top-part">
                  <div className="card-top-logo" />
                  <div className="card-top-title">Settings</div>
                </div>
                <div className="card-bottom-part">
                  <div className="card-bottom-desc">Configure the connection and application settings.</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
