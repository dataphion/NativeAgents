import React, { Component } from "react";

export default class Header extends Component {
  render() {
    return (
      <div className="header-container">
        <div className="header-left">
          <div className="header-left-logo" />
          <div className="header-left-divider" />
          <div className="header-left-logo-title">
            <span>AI </span>Tester
          </div>
        </div>
        <div className="header-right">HELP</div>
      </div>
    );
  }
}
