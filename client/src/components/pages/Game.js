import React from "react";
import NavButtons from "../nav/NavButtons";
import CardBin from "../game/CardBin";
import Timer from "../game/Timer";
import Uploader from "../game/Uploader";
import PCard from "../univ/PCard";
import PCardEditor from "../game/PCardEditor";
import Modal from "../univ/Modal";
import Link from "react-router-dom/es/Link";
import { gamePhases, saveStates, specialCards, MIN_PLAYERS } from "../../../../config.js";
const { LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER } = gamePhases;
const { UNSAVED, SAVING, SAVED } = saveStates;
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/game.css";
import "../../css/card.css";

export default class Game extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            cardModal: null,
            cardModalCreatedDuring: null,
            pCardEditModal: null,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let derivedState = {};
        if (nextProps.gameState.gamePhase !== SUBMIT || nextProps.gameState.pCards.length > 0 && nextProps.gameState.pCards[0]._id) {
            Object.assign(derivedState, {pCardEditModal: null});
        }
        if (nextProps.gameState.gamePhase !== prevState.cardModalCreatedDuring) {
            Object.assign(derivedState, {cardModal: null});
        }
        return derivedState;
    }

    render() {
        this.gameState = this.props.gameState;
        this.actions = this.props.actions;

        return (
            <div className="game_page">
                <NavButtons appState={this.props.appState} page='Game' quitGame={this.actions.quitGame} />
                
                <div className='game_page_row1'>
                    <div className="timer_section">
                        {this.gameState.gamePhase === SUBMIT ? <Timer end={this.gameState.endTime} /> : null}
                    </div>

                    <div className='judge_section'>
                        <CardBin    type='jgame'
                                    jCards={[this.gameState.gamePhase === JCHOOSE ? NO_CARD : this.gameState.jCards[this.gameState.jCardIndex]]}
                                    creators={[this.gameState.players[this.gameState.playerIds[0]]]} />
                    </div>

                    <div className="notification_section">
                            {this.isJudgeDisconnected() && !this.gameState.roundSkipped ? (
                                <div className="notification" id="alert">
                                    The judge has disconnected. Skip round?
                                    <div className="home_btn" onClick={this.actions.skipRound}> 
                                    Sure </div>
                                </div>
                            ) : null}
                            
                            {this.gameState.roundSkipped ? (
                                <div className="alert notification" id="alert">
                                    Skipping to next round...
                                </div>
                            ) : null}
                            
                            {this.gameState.gamePhase === ROUND_OVER ? 
                                <div className="notification">
                                    {this.gameState.players[this.getWinner()].name} earns a point!
                                </div>
                            : null}

                            {this.gameState.gamePhase === GAME_OVER ? 
                                <div className="notification">
                                    {this.gameState.players[this.getWinner()].name} has won!
                                    <div className='home_btn' onClick={this.actions.quitGame}>
                                        Home
                                    </div>
                                </div> 
                            : null}
                            
                            {this.props.gameState.roundNotification}

                    </div>
                </div>

                <div className="game_page_row2">
                    {[JCHOOSE, SUBMIT].includes(this.gameState.gamePhase) ? (
                        <CardBin    type='pgame'
                                    pCards={this.gameState.playerIds.slice(1).map(playerId =>
                                            playerId === this.props.appState.userId
                                            ? (this.gameState.pCards.length === 1 && this.gameState.pCards[0]._id ? this.gameState.pCards[0] : NO_CARD)
                                            : (this.gameState.players[playerId].hasPlayed ? CARDBACK : NO_CARD))}
                                    creators={this.gameState.playerIds.slice(1).map(playerId => this.gameState.players[playerId])}
                                    onClick={this.viewPCard} />
                    ) : this.gameState.gamePhase === JUDGE ? (
                        <CardBin    type='pgame'
                                    pCards={this.gameState.pCards}
                                    onClick={this.viewPCard}
                                    isJudge={this.isJudge()}
                                    judgeFocusIndex={this.gameState.pCardIndex} />
                    ) : (
                        <CardBin    type='pgame'
                                    pCards={this.gameState.pCards}
                                    creators={this.gameState.pCards.map(pCard => pCard.creator_id ? this.gameState.players[pCard.creator_id] : null)}
                                    onClick={this.viewPCard}
                                    isJudge={this.isJudge()}
                                    winnerIndex={this.gameState.pCardIndex} />
                    )}

                </div>

                <div className="game_page_row3">
                    <div className="game_code_section">
                        <div>
                            Game Code: 
                            {' ' + this.props.appState.gameCode}
                        </div>
                    </div>
                    
                    <div className='user_actionables'>
                        {this.canUploadImage() ? <Uploader upload={this.uploadImage} /> : null}
                        {this.canFlipAllPCards() ? <div className='green_home_btn' onClick={this.actions.flipAllPCards}>Flip All</div> : null}
                        {this.canSelectPCard() && this.state.cardModal !== null ? <div className='green_home_btn select_pcard_btn' onClick={this.actions.selectPCard}>Select</div> : null}
                    </div>

                    <div className='chat_box_section'>

                    </div>
                </div>

                {this.gameState.gamePhase === JCHOOSE ? (
                    <Modal>
                        <h2 className='modal_command'>
                            {this.isJudge() ? 
                                this.gameState.players[this.gameState.playerIds[0]].name + ', choose a theme:'
                             : 
                                this.gameState.players[this.gameState.playerIds[0]].name + ". is determining your fate..."
                            }

                        </h2>
                        <CardBin    type='jmodal'
                                    jCards={this.gameState.jCards}
                                    jCardsRevealed={this.gameState.jCardsRevealed}
                                    onClick={this.isJudge() ? this.actions.selectJCard : null}
                                    enlarged={true} />
                    </Modal>
                ) : null}
                {this.state.cardModal === null ? null : (
                    <Modal onClose={() => this.setState({cardModal: null})}>
                        <CardBin    type='pmodal'
                                    pCards={[this.gameState.gamePhase === SUBMIT ? this.gameState.pCards[0] : this.gameState.pCards[this.state.cardModal]]}
                                    save={this.actions.savePCard}
                                    saveIndex={this.gameState.gamePhase === SUBMIT ? 0 : this.state.cardModal} />
                    </Modal>
                )}
                {this.state.pCardEditModal}
                {this.gameState.submitFailed === null ? null : (
                    <Modal withBox={true} onClose={this.actions.closeSubmitFailedModal} disableCloseByWindow={true}>
                        Failed to submit because {this.gameState.submitFailed}.
                    </Modal>
                )}
            </div>
        );
    }

    uploadImage = image => {
        this.setState({
            pCardEditModal: (
                <Modal onClose={() => this.setState({pCardEditModal: null})} disableCloseByWindow={true}>
                    <PCardEditor image={image} submit={this.actions.submitPCard} />
                </Modal>
            )
        });
    }

    viewPCard = (pCardIndex, pCard) => {
        if ([NO_CARD, CARDBACK].includes(pCard)) return;

        if (pCard.faceup !== false) {
            this.setState({
                cardModal: pCardIndex,
                cardModalCreatedDuring: this.gameState.gamePhase
            });
        }
        if (this.isJudge()) {
            this.actions.viewPCard(pCardIndex);
        }
    }

    isJudge = () => {
        return this.props.appState.userId === this.gameState.playerIds[0];
    }

    canUploadImage = () => {
        return this.gameState.gamePhase === SUBMIT && !this.isJudge() && (this.gameState.pCards.length === 0 || !this.gameState.pCards[0]._id);
    }

    canFlipAllPCards = () => {
        return this.gameState.gamePhase === JUDGE && this.isJudge() && this.gameState.pCardsFacedown > 0;
    }

    canSelectPCard = () => {
        return this.gameState.gamePhase === JUDGE && this.isJudge() && this.gameState.pCardsFacedown === 0 && this.gameState.pCardIndex !== null;
    }

    getWinner = () => {
        const ans = [ROUND_OVER, GAME_OVER].includes(this.gameState.gamePhase) && this.gameState.pCards[this.gameState.pCardIndex].creator_id || null;
        console.log("winner: " + ans);
        return ans;
    }

    // enable skip round
    isJudgeDisconnected = () => {
        return [JCHOOSE, SUBMIT, JUDGE].includes(this.gameState.gamePhase) && !this.gameState.players[this.gameState.playerIds[0]].connected;
    }

    // stall at JCHOOSE
    tooFewPlayers = () => {
        return this.gameState.playerIds.length < MIN_PLAYERS;
    }
}