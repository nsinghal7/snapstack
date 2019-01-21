import React from "react";
import "../../css/univ.css";

export default class Modal extends React.Component {
    render() {
        return (
            <div className="modal_container">
                <div>
                    {this.props.children}
                </div>
                <div className="modal_close_btn" onClick={this.props.onClose} />
            </div>
        );
    }
}
