const gameStates = {
    LOBBY: 0,
    JCHOOSE: 1,
    SUBMIT: 2,
    JUDGE: 3,
    ROUND_OVER: 4,
    GAME_OVER: 5,
};

const MIN_PLAYERS = 3;

const MAX_PLAYERS = 7;

const TIME_LIMIT_MILLIS = 120000;

const NUM_JCARDS = 3;

const CARDS_TO_WIN = 3;

module.exports = {gameStates, MAX_PLAYERS, TIME_LIMIT_MILLIS, NUM_JCARDS, CARDS_TO_WIN};