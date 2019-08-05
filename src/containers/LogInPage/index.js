import React, { Component } from "react";
import Request from "../../utils/request";
import Modal from "../../components/Modal";
import notification from "../../components/Notification";
import SignInSignUp from "../../components/SignInSignUp";
import "./index.scss";

class LogIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      password: "",
      modal: {
        visible: false
      }
    };
  }

  async login() {
    const { name, password } = this.state;
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(name)) {
      notification(
        "Username can only be composed of Chinese characters, numbers, letters, and underscores.",
        "warn"
      );
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(password)) {
      notification(
        "Passwords can only be composed of alphanumeric characters",
        "warn"
      );
      return;
    }
    try {
      const res = await Request.axios("post", "/api/v1/login", {
        name,
        password
      });
      if (res && res.success) {
        localStorage.setItem("userInfo", JSON.stringify(res.userInfo));
        // Pop-ups
        this.setState({
          modal: {
            visible: true
          }
        });
      } else {
        notification(res.message, "error");
      }
    } catch (error) {
      notification(error, "error");
    }
  }

  setValue = value => {
    const { name, password } = value;
    this.setState(
      {
        name,
        password
      },
      async () => {
        await this.login();
      }
    );
  };

  confirm = () => {
    this.setState({
      modal: {
        visible: true
      }
    });
    window.location.reload();
    const originalLink = sessionStorage.getItem("originalLink");
    if (originalLink) {
      sessionStorage.removeItem("originalLink");
      window.location.href = originalLink;
      return;
    }
    window.location.href = "/";
  };

  render() {
    const { visible } = this.state.modal;
    return (
      <div className="login">
        <Modal
          title="prompt"
          visible={visible}
          confirm={this.confirm}
          hasConfirm
        >
          <p className="content">{"You have logged in successfully"}</p>
        </Modal>
        <SignInSignUp setValue={this.setValue} isLogin />
      </div>
    );
  }
}

export default LogIn;
