import React from "react";
import Loader from "react-loader-spinner";

export default class Loaders extends React.Component {
  render() {
    return (
      <div className="loader-css">
        <Loader type="RevolvingDot" color="#ff9879" height={this.props.status ? 100 : 0} width={this.props.status ? 100 : 0} />
      </div>
    );
  }
}
