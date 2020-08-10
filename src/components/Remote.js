import React, { Component } from "react";
import Draggable from "react-draggable";

export default class Remote extends Component {
  render() {
    return (
      <Draggable bounds="body" handle=".remote-container" defaultPosition={{ x: 0, y: 0 }} grid={[1, 1]} scale={1}>
        <div className="remote-container" style={!this.props.remoteVisible ? { display: "none" } : {}}>
          <div className="remote-top-container" onClick={this.props.onHide}>
            X
          </div>
          <div className="remote-body-container">
            <div className="remote-button" onClick={() => this.props.remoteClick("up")}>
              <i className="fa fa-arrow-up" />
            </div>
            <div className="remote-multi-button">
              <div className="remote-button" onClick={() => this.props.remoteClick("left")}>
                <i className="fa fa-arrow-left" />
              </div>
              <div className="remote-button" onClick={() => this.props.remoteClick("select")}>
                OK
              </div>
              <div className="remote-button" onClick={() => this.props.remoteClick("right")}>
                <i className="fa fa-arrow-right" />
              </div>
            </div>
            <div className="remote-button" onClick={() => this.props.remoteClick("down")}>
              <i className="fa fa-arrow-down" />
            </div>
            <div className="remote-multi-button" style={{ marginTop: "50px" }}>
              <div className="remote-button" onClick={() => this.props.remoteClick("back")}>
                <i className="fa fa-reply" />
              </div>
              <div className="remote-button" onClick={() => this.props.remoteClick("home")}>
                <i className="fa fa-home" />
              </div>
            </div>
          </div>
        </div>
      </Draggable>
    );
  }
}
