import React, { Component } from "react";
import Image from "./Image.js";
import Caption from "./Caption.js";
import Modal from "./Modal.js";

import "../../css/card.css";

export default class PCard extends Component {
    render() {
        switch (this.props.src) {
            case NO_CARD:
                return (
                    <div onClick={this.props.onClick}>
                    </div>
                );
            case CARDBACK:
            case FACEDOWN_CARD:
                return (
                    <div onClick={this.props.onClick}>
                    </div>
                );
            default:
                if (this.props.faceup === false) {
                    return (
                        <div onClick={this.props.onClick}>
                        </div>
                    );
                } else {
                    return (
                        <div className={this.props.enlarged ? 'pcard_enlarged' : 'pcard'} onClick={this.props.onClick}>
                            <div className='container'>
                                <img src={this.props.image} />
                            </div>
                            <Caption text={this.props.text} />
                            <SaveButton saveState={this.props.saveState} save={this.props.save} />
                        </div>
                    );
                }
        }
    }
}
        // if (this.props.faceup) {
        //     if (this.props.zoomed) {
        //         return (
        //         <Modal modalType="zoom_card">
        //             <div className="container"> 
        //                 <Image />
        //             </div>
        //             <Caption text=':chrissexy:' />
        //         </Modal>
        //         );
        //     } else {
        //         return (
        //         <div className="card">
        //             <div className="container"> 
        //                 <Image />
        //             </div>
        //             <Caption text=':chrissexy:' />
        //         </div>
        //         );
        //     }

        // }
        // else {
        //     return (
        //         null
        //     );
        //     // return (
        //     //     <div>
        //     //         <Cardback type={this.props.type} />
        //     //     </div>
        //     // );
        // }