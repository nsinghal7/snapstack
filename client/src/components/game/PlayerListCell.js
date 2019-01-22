import React from "react";
import PlayerInfo from "../univ/PlayerInfo";

export default class PlayerListCell extends React.Component {
    render() {
        return (
            <div>
                <PlayerInfo name={this.props.player.name} avatar={this.props.player.avatar} media={this.props.player.media} />
            </div>
        );
    }
}