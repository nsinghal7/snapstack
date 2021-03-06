import React from "react";
import io from "socket.io-client";
import update from "immutability-helper";
import Lobby from "./Lobby";
import Game from "./Game";
import Chat from "../game/Chat";
import {gamePhases, saveStates, CARDS_TO_WIN, MIN_PLAYERS} from "../../../../config.js";
const { LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER } = gamePhases;
const { UNSAVED, SAVING, SAVED } = saveStates;

import "../../css/game.css";

export default class GameContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            gamePhase: null, // LOBBY, JCHOOSE, SUBMIT, JUDGE, ROUND_OVER, GAME_OVER
            playerIds: [], // judge is playerIds[0]
            players: {}, // {_id: {_id, name, avatar, media{fb, insta}, score, hasPlayed, connected}}
            jCards: null, // [string]; [NUM_JCARDS] if JCHOOSE, [NUM_JCARDS or 1] otherwise
            jCardIndex: null, // selected if SUBMIT, JUDGE, ROUND_OVER, or GAME_OVER
            pCards: null, // [{_id, image, text, faceup, creator_id, saveState}]; [0] if JCHOOSE, [0] or [1] if SUBMIT, [n] otherwise
            pCardIndex: null, // selected or null if JUDGE, winner if ROUND_OVER or GAME_OVER
            pCardsFacedown: 0, // if JUDGE
            endTime: null, // if SUBMIT
            cardsToWin: null,
            roundSkipped: false, // if JCHOOSE, SUBMIT, or JUDGE
            chatMessages: [], // array of pairs of form [message, sender _id]
            submitFailed: null, // null or reason if SUBMIT
            roundNotification: null,
            roundNotificationTimeout: null
        };

        this.actions = {
            startGame: this.startGame,
            selectJCard: this.selectJCard,
            submitPCard: this.submitPCard,
            viewPCard: this.viewPCard,
            flipAllPCards: this.flipAllPCards,
            selectPCard: this.selectPCard,
            skipRound: this.skipRound,
            savePCard: this.savePCard,
            quitGame: this.quitGame,
            sendChat: this.sendChat,
            closeSubmitFailedModal: this.closeSubmitFailedModal
        }

        this.socket = this.createSocket();
    }

    componentWillUnmount() {
        this.socket.disconnect();
    }

    render() {
        if (this.state.gamePhase === null) return null;

        console.log(this.state);
        console.log(this.props.appState);
        return (
            <React.Fragment>
                {this.state.gamePhase === LOBBY ? (
                    <Lobby  appState={this.props.appState}
                            gameState={this.state}
                            actions={this.actions} />
                ) : (
                    <Game   appState={this.props.appState}
                            gameState={this.state}
                            actions={this.actions} />
                )}

                <Chat playerMap={this.state.players} userId={this.props.appState.userId}
                    chatMessages={this.state.chatMessages} sendChat={this.sendChat} />
            </React.Fragment>
        );
    }

    setRoundNotification = text => {
        clearTimeout(this.state.roundNotificationTimeout);
        const timeout = setTimeout(() => {
            this.setState({
                roundNotification: null,
                roundNotificationTimeout: null
            });
        }, 3000);
        this.setState({
            roundNotification: (
                <div className="notification">
                    {text}
                </div>
            ),
            roundNotificationTimeout: timeout
        });
    };

    startGame = () => {
        this.socket.emit('startGame');
    }

    // judge action
    selectJCard = jCardIndex => {
        this.setState({
            jCardIndex: jCardIndex
        });
        this.socket.emit('jCardChoice', jCardIndex);
    }

    // player action
    submitPCard = (image, text) => {
        this.setState((prevState, props) => ({
            pCards: [{
                image: image,
                text: text,
                creator_id: props.appState.userId,
                faceup: true,
                saveState: UNSAVED
            }]
        }));
        this.socket.emit('submitCard', image, text);
    }

    // judge action
    viewPCard = pCardIndex => {
        if (!this.state.pCards[pCardIndex].faceup) {
            this.setState((prevState, props) => ({
                pCards: update(prevState.pCards, {[pCardIndex]: {faceup: {$set: true}}}),
                pCardIndex: pCardIndex,
                pCardsFacedown: prevState.pCardsFacedown - 1
            }));
            this.socket.emit('flip', pCardIndex);
        } else {
            this.setState({
                pCardIndex: pCardIndex
            });
            this.socket.emit('look', pCardIndex);
        }
    }

    // judge action
    flipAllPCards = () => {
        this.setState((prevState, props) => ({
            pCards: prevState.pCards.map(pCard => update(pCard, {faceup: {$set: true}})),
            pCardsFacedown: 0
        }));
        this.socket.emit('flipAll');
    }

    // judge action
    selectPCard = () => {
        this.socket.emit('select', this.state.pCardIndex);
    }

    skipRound = () => {
        this.setState({
            roundSkipped: true
        });
        this.socket.emit('skip');
    }

    savePCard = pCardIndex => {
        let pCardId = this.state.pCards[pCardIndex]._id;
        this.setState((prevState, props) => ({
            pCards: prevState.pCards.map(pCard =>
                        pCard._id === pCardId
                        ? update(pCard, {saveState: {$set: SAVING}})
                        : pCard
                    )
        }));
        this.socket.emit('saveCard', pCardId);
    }

    quitGame = reason => {
        this.socket.disconnect();
        this.props.quitGame(reason);
    }


    sendChat = message => {
        this.socket.emit('chat', message);
    }

    closeSubmitFailedModal = () => {
        this.setState({
            submitFailed: null
        });
    }


    onConnect = () => {
        if (this.props.appState.gameCode === '?') {
            this.socket.emit('newGame', CARDS_TO_WIN);
        } else {
            this.socket.emit('joinGame', this.props.appState.gameCode);
        }
    }

    isJudge = () => {
        return this.props.appState.userId === this.state.playerIds[0];
    }

    createSocket = () => {
        let socket = io();
        socket.on('connect', () => {
            this.onConnect();
        });
        socket.on('rejectConnection', reason => {
            this.quitGame(reason);
        });
        socket.on('gameState', (players, gamePhase, jCards, pCards, pCardIndex, endTime, cardsToWin, roundSkipped, gameCode) => {
            this.props.enterGame(gameCode);
            this.setState((prevState, props) => ({
                gamePhase: gamePhase,
                playerIds: players.map(player => player._id),
                players: Object.assign({}, ...players.map(player => ({[player._id]: player}))),
                jCards: jCards,
                jCardIndex: 0,
                pCards: pCards,
                pCardIndex: pCardIndex,
                pCardsFacedown: pCards.reduce((num, pCard) => num + !pCard.faceup, 0),
                endTime: endTime,
                cardsToWin: cardsToWin,
                roundSkipped: roundSkipped
            }));
        });
        socket.on('nuj', player => {
            let playerIds = this.state.playerIds.includes(player._id)
                            ? this.state.playerIds
                            : update(this.state.playerIds, {$push: [player._id]});
            this.setState((prevState, props) => ({
                playerIds: playerIds,
                players: update(prevState.players, {[player._id]: {$set: player}})
            }));
        });
        socket.on('judgeAssign', (playerIds, jCards) => {
            this.setState((prevState, props) => ({
                gamePhase: JCHOOSE,
                playerIds: playerIds,
                players: update(prevState.players, Object.assign({}, ...prevState.playerIds.map(playerId =>
                            ({[playerId]: {hasPlayed: {$set: false}}})))),
                jCards: jCards,
                jCardsRevealed: 0,
                pCards: [],
                roundSkipped: false
            }));
            const interval = setInterval(() => {
                if (this.state.jCardsRevealed < this.state.jCards.length) {
                    this.setState((prevState, props) => ({
                        jCardsRevealed: prevState.jCardsRevealed + 1
                    }));
                } else {
                    clearInterval(interval);
                }
            }, 500);
        });
        socket.on('roundStart', (jCardIndex, endTime) => {
            this.setState((prevState, props) => ({
                gamePhase: SUBMIT,
                jCardIndex: jCardIndex,
                endTime: endTime
            }));
            this.setRoundNotification(this.isJudge() ?
                "Hang tight while everyone else makes cards for you to judge!"
                : "The theme has been set! Make your card!");
        });
        socket.on('turnedIn', (creator_id, pCard_id) => {
            this.setState((prevState, props) => ({
                players: update(prevState.players, {[creator_id]: {hasPlayed: {$set: true}}}),
                pCards: prevState.pCards.map(pCard =>
                            (pCard.creator_id === creator_id ||
                            pCard._id === pCard_id && prevState.gamePhase !== SUBMIT)
                            ? update(pCard, {
                                _id: {$set: pCard_id},
                                creator_id: {$set: creator_id}
                            })
                            : pCard
                        )
            }));
            if(pCard_id) {
                this.setRoundNotification("Hang tight while everyone else submits their card");
            }
        });
        socket.on('pCards', pCards => {
            this.setState((prevState, props) => ({
                gamePhase: JUDGE,
                pCards: pCards.map(pCard => // TODO flip own card facedown first in animation
                            prevState.pCards.length === 1 && pCard._id === prevState.pCards[0]._id
                            ? update(pCard, {
                                creator_id: {$set: prevState.pCards[0].creator_id},
                                saveState: {$set: prevState.pCards[0].saveState}
                            })
                            : update(pCard, {
                                creator_id: {$set: null},
                                saveState: {$set: UNSAVED}
                            })
                        ),
                pCardIndex: null,
                pCardsFacedown: pCards.length
            }));
            this.setRoundNotification(this.isJudge() ?
                "Submissions are done! Now choose the best card!"
                : "Submissions are done! Now the judge will pick the best card");
        });
        socket.on('flip', pCardIndex => {
            this.setState((prevState, props) => ({
                pCards: update(prevState.pCards, {[pCardIndex]: {faceup: {$set: true}}}),
                pCardIndex: pCardIndex,
                pCardsFacedown: Math.max(prevState.pCardsFacedown - 1, 0)
            }));
        });
        socket.on('flipAll', () => {
            this.setState((prevState, props) => ({
                pCards: prevState.pCards.map(pCard => update(pCard, {faceup: {$set: true}})),
                pCardsFacedown: 0
            }));
        });
        socket.on('look', pCardIndex => {
            this.setState((prevState, props) => ({
                pCardIndex: pCardIndex
            }));
        });
        socket.on('select', (pCardIndex, creator_ids) => {
            this.setState((prevState, props) => ({
                gamePhase: ROUND_OVER,
                players: update(prevState.players, {[creator_ids[pCardIndex]]: {score: (score => score + 1)}}),
                pCards: prevState.pCards.map((pCard, index) => update(pCard, {creator_id: {$set: creator_ids[index]}})),
                pCardIndex: pCardIndex
            }));
        });
        socket.on('gameOver', () => {
            this.setState((prevState, props) => ({
                gamePhase: GAME_OVER
            }));
        });
        socket.on('disconnected', dcId => {
            this.setState((prevState, props) => ({
                playerIds: prevState.gamePhase === LOBBY
                            ? prevState.playerIds.filter(playerId => playerId !== dcId)
                            : prevState.playerIds,
                players: update(prevState.players, {[dcId]: {connected: {$set: false}}})
            }));
        });
        socket.on('skipped', () => {
            this.setState((prevState, props) => ({
                roundSkipped: true
            }));
        });
        socket.on('cardSaved', pCardId => {
            this.setState((prevState, props) => ({
                pCards: prevState.pCards.map(pCard =>
                            pCard._id === pCardId
                            ? update(pCard, {saveState: {$set: SAVED}})
                            : pCard
                        )
            }));
        });
        socket.on('cardSaveFailed', pCardId => {
            this.setState((prevState, props) => ({
                pCards: prevState.pCards.map(pCard =>
                            pCard._id === pCardId
                            ? update(pCard, {saveState: {$set: UNSAVED}})
                            : pCard
                        )
            }));
        });

        socket.on('chat', (message, userId) => {
            let chatMessages = this.state.chatMessages.concat([[message, userId]]);
            if(chatMessages.length > 300) {
                chatMessages = chatMessages.slice(150);
            }
            this.setState((prevState, props) => ({
                chatMessages: chatMessages
            }));
        });
        socket.on('submitCardFailed', reason => {
            this.setState((prevState, props) => ({
                submitFailed: reason
            }));
        });
        return socket;
    }
}