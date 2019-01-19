import React from "react";
import NavButtons from "../nav/NavButtons";
import Title from "../univ/Title";
import Popup from "../univ/Popup";

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            joinGamePopup: false,
            newGameWarningPopup: false,
            joinGameWarningPopup: false
        };
    }

    render() {
        return (
            <div>
                <NavButtons appState={this.props.appState} page='Home' />
                <Title />
                <div className="home_btn" onClick={this.onNewGame}>New Game</div>
                <div className="home_btn" onClick={this.onJoinGame}>Join Game</div>
                {this.state.joinGamePopup ? // TODO
                    <Popup onClose={() => this.setState({joinGamePopup: false})}>
                        Enter game code:
                        <input type="text" />
                        <div onClick={() => this.props.enterGame('XZXZ')}>Play!</div>
                    </Popup>
                : null}
                {this.state.newGameWarningPopup ?
                    <Popup onClose={() => this.setState({newGameWarningPopup: false})}>
                        This will quit your ongoing game. Are you sure?
                        <div onClick={() => {this.props.quitGame(); this.onNewGame();}}>Yes</div>
                    </Popup>
                : null}
                {this.state.joinGameWarningPopup ?
                    <Popup onClose={() => this.setState({joinGameWarningPopup: false})}>
                        This will quit your ongoing game. Are you sure?
                        <div onClick={() => {this.props.quitGame(); this.onJoinGame();}}>Yes</div>
                    </Popup>
                : null}
            </div>
        );
    }

    onNewGame = () => {
        if (this.props.appState.gameCode === null) {
            this.props.enterGame('XZXZ'); //TODO
        }
        else {
            this.setState({
                joinGamePopup: false,
                newGameWarningPopup: true,
                joinGameWarningPopup: false
            });
        }
    }

    onJoinGame = () => {
        if (this.props.appState.gameCode === null) {
            this.setState({
                joinGamePopup: true,
                newGameWarningPopup: false,
                joinGameWarningPopup: false
            });
        }
        else {
            this.setState({
                joinGamePopup: false,
                newGameWarningPopup: false,
                joinGameWarningPopup: true
            });
        }
    }
}
