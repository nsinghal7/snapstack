import React from "react";
import NavButtons from "../nav/NavButtons";
import PlayerList from "../game/PlayerList";
import { MIN_PLAYERS } from "../../../../config.js";

import "../../css/game.css";
import "../../css/lobby.css";

export default class Lobby extends React.Component {
    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="lobby_page">
                <NavButtons appState={this.props.appState} page='Lobby' quitGame={this.actions.quitGame} />
                <div className="start_btn_div">
                    {this.canStartGame() ? (
                        <div className="enabled_start_btn" onClick={this.actions.startGame}>Start Game</div>
                    ) : (
                        <div className="disabled_start_btn">Start Game</div>
                    )}
                </div>

                <div className="non_start_btn">
                    <div className="game_info">
                        <h2>
                            Game Code:
                        </h2>
                        <div className="game_code"> {this.props.appState.gameCode}
                        </div>
                        
                        <h2>
                            # Cards to Win: 

                        </h2>
                        <div className="game_settings">
                            {this.gameState.cardsToWin}
                        </div>
                        <h2>
                            Time limit per round:
                        </h2>
                        <div className="game_settings">
                            2 min
                        </div>
                        <h2>
                            # players:
                        </h2>
                        <div className="game_settings">
                            3 - 8
                        </div>


                    </div>

                    <div className="whos_joined">
                        <h2> Who's Joined: 
                        </h2>
                        <PlayerList players={this.gameState.playerIds.map(playerId => this.gameState.players[playerId])} />
                    </div>
                </div>


            </div>
        );
    }

    canStartGame = () => {
        return this.gameState.playerIds.length >= MIN_PLAYERS;
    }
}