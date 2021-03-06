import React from "react";
import JCard from "../univ/JCard";
import PCard from "../univ/PCard";
import PlayerInfo from "../univ/PlayerInfo";
import { specialCards } from "../../../../config.js";
const { NO_CARD, CARDBACK, FACEDOWN_CARD, LOADING_CARD } = specialCards;

import "../../css/card.css";

export default class CardBin extends React.Component {
    render() {
        return (
            <div className={this.props.type+'_card_bin'}>
                {this.props.jCards ? this.props.jCards.map((jCard, index) => (
                    <div key={index} className="card_slot">
                        <div className="card_area">
                            <JCard  src={jCard}
                                    text={jCard}
                                    onClick={this.props.onClick ? (() => this.props.onClick(index, jCard)) : null}
                                    faceup={this.props.jCardsRevealed !== undefined ? index < this.props.jCardsRevealed : true} />
                        </div>
                        {['jgame', 'pgame'].includes(this.props.type) ? (
                            <div className="card_info_area">
                                {!this.props.creators || !this.props.creators[index] ? null : (
                                    <PlayerInfo name={this.props.creators[index].name}
                                                avatar={this.props.creators[index].avatar}
                                                media={this.props.creators[index].media}
                                                score={this.props.creators[index].score}
                                                connected={this.props.creators[index].connected}
                                                _id={this.props.creators[index]._id} />
                                )}
                            </div>
                        ) : null}
                    </div>
                )) : null}
                {this.props.pCards ? this.props.pCards.map((pCard, index) => (
                    <div key={index} className='card_slot'>
                        <div className="card_area">
                            <PCard  src={pCard}
                                    image={pCard.image}
                                    text={pCard.text}
                                    faceup={pCard.faceup}
                                    onClick={this.props.onClick ? (this.props.isJudge !== false || pCard.faceup ? () => this.props.onClick(index, pCard) : null) : null}
                                    saveState={this.props.save ? pCard.saveState : null}
                                    save={this.props.save ? (() => this.props.save(this.props.saveIndex !== undefined ? this.props.saveIndex : index)) : null}
                                    creator={['jpmodal'].includes(this.props.type) && index < this.props.creators.length ? this.props.creators[index].name : null}
                                    creatorId={['jpmodal'].includes(this.props.type) && index < this.props.creators.length ? this.props.creators[index]._id : null}
                                    userId={this.props.userId}
                                    highlight={[this.props.judgeFocusIndex, this.props.winnerIndex].includes(index)} />
                        </div>
                        {['jgame', 'pgame'].includes(this.props.type) ? (
                            <div className='card_info_area'>
                                {!this.props.creators || !this.props.creators[index] ? null : (
                                    <PlayerInfo name={this.props.creators[index].name}
                                                avatar={this.props.creators[index].avatar}
                                                media={this.props.creators[index].media}
                                                score={this.props.creators[index].score}
                                                connected={this.props.creators[index].connected}
                                                _id={this.props.creators[index]._id} />
                                )}
                            </div>
                        ) : null}
                    </div>
                )) : null}
            </div>
        );
    }
}
