import React, { Component } from "react";
import Header from "../components/Header";
import { Link } from "react-router-dom";

export default class Terminal extends Component {
  componentDidMount() {}

  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="terminal-container animated fadeIn faster">
          <div className="terminal-header-container">
            <div className="left-part">
              <Link to="/" className="header-button-bg">
                <div className="stop-btn-logo" />
              </Link>
              <div className="status-container">SERVER IS RUNNING</div>
            </div>
            <div className="right-part">
              <Link to="/session" className="header-button-bg">
                <div className="target-btn-logo" />
              </Link>
              <div className="header-button-bg">
                <div className="download-btn-logo" />
              </div>
              <div className="header-search-bg">
                <div className="search-btn-logo" />
                <input type="text" placeholder="Search" />
              </div>
            </div>
          </div>
          <div className="terminal-logs-container">
            [2019-12-27T14:42:28.970Z] debug GET /users-permissions/init (88 ms) 200 [2019-12-27T14:42:29.032Z] debug GET /admin/init (3 ms) 200 [2019-12-27T14:42:29.240Z] debug GET
            /content-manager/content-types (17 ms) 200 [2019-12-27T14:42:29.454Z] debug GET 917af369543435f7ea1cf2f7f443.png (6 ms) 200 [2019-12-27T14:42:29.455Z] debug GET
            a94400e92f6e0cb08ec16118e86f.png (5 ms) 200 [2019-12-27T14:42:29.455Z] debug GET f4b3dab44f0fcda646945e133b9f.png (3 ms) 200 [2019-12-27T14:42:29.466Z] debug GET
            5f166e78eadd0b14b7b0b41c4b28.png (4 ms) 200 [2019-12-27T14:42:29.466Z] debug GET b471e23e696377caba384242af1c.png (3 ms) 200 [2019-12-27T14:42:28.970Z] debug GET /users-permissions/init
            (88 ms) 200 [2019-12-27T14:42:29.032Z] debug GET /admin/init (3 ms) 200 [2019-12-27T14:42:29.240Z] debug GET /content-manager/content-types (17 ms) 200 [2019-12-27T14:42:29.454Z] debug GET
            917af369543435f7ea1cf2f7f443.png (6 ms) 200 [2019-12-27T14:42:29.455Z] debug GET a94400e92f6e0cb08ec16118e86f.png (5 ms) 200 [2019-12-27T14:42:29.455Z] debug GET
            f4b3dab44f0fcda646945e133b9f.png (3 ms) 200 [2019-12-27T14:42:29.466Z] debug GET 5f166e78eadd0b14b7b0b41c4b28.png (4 ms) 200 [2019-12-27T14:42:29.466Z] debug GET
            b471e23e696377caba384242af1c.png (3 ms) 200 [2019-12-27T14:42:28.970Z] debug GET /users-permissions/init (88 ms) 200 [2019-12-27T14:42:29.032Z] debug GET /admin/init (3 ms) 200
            [2019-12-27T14:42:29.240Z] debug GET /content-manager/content-types (17 ms) 200 [2019-12-27T14:42:29.454Z] debug GET 917af369543435f7ea1cf2f7f443.png (6 ms) 200 [2019-12-27T14:42:29.455Z]
            debug GET a94400e92f6e0cb08ec16118e86f.png (5 ms) 200 [2019-12-27T14:42:29.455Z] debug GET f4b3dab44f0fcda646945e133b9f.png (3 ms) 200 [2019-12-27T14:42:29.466Z] debug GET
            5f166e78eadd0b14b7b0b41c4b28.png (4 ms) 200 [2019-12-27T14:42:29.466Z] debug GET b471e23e696377caba384242af1c.png (3 ms) 200 [2019-12-27T14:42:28.970Z] debug GET /users-permissions/init
            (88 ms) 200 [2019-12-27T14:42:29.032Z] debug GET /admin/init (3 ms) 200 [2019-12-27T14:42:29.240Z] debug GET /content-manager/content-types (17 ms) 200 [2019-12-27T14:42:29.454Z] debug GET
            917af369543435f7ea1cf2f7f443.png (6 ms) 200 [2019-12-27T14:42:29.455Z] debug GET a94400e92f6e0cb08ec16118e86f.png (5 ms) 200 [2019-12-27T14:42:29.455Z] debug GET
            f4b3dab44f0fcda646945e133b9f.png (3 ms) 200 [2019-12-27T14:42:29.466Z] debug GET 5f166e78eadd0b14b7b0b41c4b28.png (4 ms) 200 [2019-12-27T14:42:29.466Z] debug GET
            b471e23e696377caba384242af1c.png (3 ms) 200 [2019-12-27T14:42:28.970Z] debug GET /users-permissions/init (88 ms) 200 [2019-12-27T14:42:29.032Z] debug GET /admin/init (3 ms) 200
            [2019-12-27T14:42:29.240Z] debug GET /content-manager/content-types (17 ms) 200 [2019-12-27T14:42:29.454Z] debug GET 917af369543435f7ea1cf2f7f443.png (6 ms) 200 [2019-12-27T14:42:29.455Z]
            debug GET a94400e92f6e0cb08ec16118e86f.png (5 ms) 200 [2019-12-27T14:42:29.455Z] debug GET f4b3dab44f0fcda646945e133b9f.png (3 ms) 200 [2019-12-27T14:42:29.466Z] debug GET
            5f166e78eadd0b14b7b0b41c4b28.png (4 ms) 200 [2019-12-27T14:42:29.466Z] debug GET b471e23e696377caba384242af1c.png (3 ms) 200
          </div>
        </div>
      </React.Fragment>
    );
  }
}
