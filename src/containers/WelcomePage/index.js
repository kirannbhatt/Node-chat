import React, { Component } from "react";
import "./styles.scss";

export default class welcome extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div className="welcomeWrapper">
        <p className="title">Welcome</p>
        <p className="content">
          Select a group/user to start chatting ε==(づ'▽`)づ
        </p>
      </div>
    );
  }
}
