import classNames from 'classnames';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { MatchItems } from './matchItems';
import './styles.scss';

const LOCAL_STORAGE_KEY = 'mm-record';

function App() {
    const [matchItems, setMatchItems] = useState(MatchItems.initialize());
    const [matchItemRows, setMatchItemRows] = useState([]);
    const [firstActiveItem, setFirstActiveItem] = useState(null);
    const [secondActiveItem, setSecondActiveItem] = useState(null);
    const [matches, setMatches] = useState([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [moves, setMoves] = useState(0);
    const [isInProgress, setIsInProgress] = useState(false);
    const [time, setTime] = useState(0); // time in seconds
    const [showGameResults, setShowGameResults] = useState(false);
    const [isNewRecord, setIsNewRecord] = useState({
        time: false,
        moves: false,
    });
    const [currentRecord, setCurrentRecord] = useState({
        time: null,
        moves: null,
    });

    useEffect(() => {
        setMatchItemRows(matchItems.createRows());
    }, [matchItems]);

    const resetGame = useCallback(() => {
        setMatchItems(MatchItems.initialize());
        setFirstActiveItem(null);
        setSecondActiveItem(null);
        setMatches([]);
        setIsGameOver(false);
        setMoves(0);
        setTime(0);
        setIsInProgress(false);
        setShowGameResults(false);
        setIsNewRecord({ time: false, moves: false });
    }, []);

    const resetActiveItems = useCallback(() => {
        setFirstActiveItem(null);
        setSecondActiveItem(null);
    }, []);

    useEffect(() => {
        if (
            firstActiveItem &&
            secondActiveItem &&
            firstActiveItem.value === secondActiveItem.value
        ) {
            setMatches(state => [
                ...state,
                firstActiveItem.id,
                secondActiveItem.id,
            ]);
            resetActiveItems();
        }
    }, [firstActiveItem, resetActiveItems, secondActiveItem]);

    const handleClick = useCallback(
        (id, value) => {
            if (isGameOver) {
                return;
            }

            if (
                (firstActiveItem && id === firstActiveItem.id) ||
                matches.includes(id)
            ) {
                return;
            }

            if (!firstActiveItem) {
                if (!isInProgress) {
                    setIsInProgress(true);
                }
                setFirstActiveItem({ id, value });
                setMoves(state => state + 1);
            } else if (!secondActiveItem) {
                setSecondActiveItem({ id, value });
                setMoves(state => state + 1);
                //setTimeout(() => resetActiveItems(), 1000);
            } else {
                resetActiveItems();
            }
        },
        [
            firstActiveItem,
            isGameOver,
            isInProgress,
            matches,
            resetActiveItems,
            secondActiveItem,
        ],
    );

    useEffect(() => {
        if (matches.length === 16) {
            setIsGameOver(true);
            setShowGameResults(true);
            if (currentRecord.time === null && currentRecord.moves === null) {
                setIsNewRecord({ time: true, moves: true });
                setCurrentRecord({ time, moves });
                return;
            }

            if (currentRecord.time > time) {
                setIsNewRecord(state => ({ ...state, time: true }));
                setCurrentRecord(state => ({ ...state, time }));
            }

            if (currentRecord.moves > moves) {
                setIsNewRecord(state => ({ ...state, moves: true }));
                setCurrentRecord(state => ({ ...state, moves }));
            }
        }
    }, [currentRecord, matches, moves, time]);

    useEffect(() => {
        let intervalId;
        if (isInProgress) {
            intervalId = setTimeout(() => setTime(time + 1), 1000);
        }

        if (isGameOver) {
            clearInterval(intervalId);
        }

        return () => clearInterval(intervalId);
    }, [isGameOver, isInProgress, time]);

    useEffect(() => {
        const record = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (record) {
            setCurrentRecord(JSON.parse(record));
        }
    }, []);

    useEffect(() => {
        const newRecord = JSON.stringify(currentRecord);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, newRecord);
    }, [currentRecord]);

    const gameTimeDisplay = new Date(time * 1000).toISOString().substr(14, 5);
    const recordTimeDisplay =
        currentRecord.time === null
            ? null
            : new Date(currentRecord.time * 1000).toISOString().substr(14, 5);
    return (
        <div className="game-space">
            <div className="game-stats">
                <h1>memory match</h1>
                <div>
                    <button className="primary" onClick={resetGame}>
                        start over
                    </button>
                </div>
                {recordTimeDisplay !== null && (
                    <h5>your best time: {recordTimeDisplay}</h5>
                )}
                {currentRecord.moves !== null && (
                    <h5>your best moves: {currentRecord.moves}</h5>
                )}
                <p>moves: {moves}</p>
                <p>time: {gameTimeDisplay}</p>
            </div>
            <div className="container game-play">
                {matchItemRows.map((items, rIndex) => (
                    <div key={rIndex} className="row game-row">
                        {items.map(item => {
                            const isMatch = matches.includes(item.id);
                            const isVisible =
                                firstActiveItem?.id === item.id ||
                                secondActiveItem?.id === item.id ||
                                isMatch;
                            return (
                                <div
                                    className={classNames('col-sm-3 game-col', {
                                        'selected-item': isMatch,
                                    })}
                                    key={item.id}
                                    onClick={() =>
                                        handleClick(item.id, item.value)
                                    }
                                >
                                    <img
                                        src={
                                            isVisible
                                                ? item.image
                                                : './images/question.png'
                                        }
                                        alt="card"
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            {showGameResults && (
                <div className="game-modal">
                    <div className="card">
                        <span
                            className="game-modal-close"
                            onClick={() => setShowGameResults(false)}
                        ></span>
                        <h3 className="section">you win</h3>
                        <div className="section">
                            <p>
                                {isNewRecord.time && (
                                    <Fragment>
                                        <mark className="tertiary">
                                            new record
                                        </mark>{' '}
                                    </Fragment>
                                )}
                                your time: {gameTimeDisplay}
                            </p>
                            {!isNewRecord.time && (
                                <p>
                                    <small>
                                        {currentRecord.time - time < 0
                                            ? `just ${
                                                  time - currentRecord.time
                                              } seconds away from a new record!`
                                            : 'you tied your current record'}
                                    </small>
                                </p>
                            )}
                            <p>
                                {isNewRecord.moves && (
                                    <Fragment>
                                        <mark className="tertiary">
                                            new record
                                        </mark>{' '}
                                    </Fragment>
                                )}
                                your moves: {moves}
                            </p>
                            {!isNewRecord.moves && (
                                <p>
                                    <small>
                                        {currentRecord.moves - moves < 0
                                            ? `only ${
                                                  moves - currentRecord.moves
                                              } moves over your record!`
                                            : 'you tied your current record'}
                                    </small>
                                </p>
                            )}
                            <button className="primary" onClick={resetGame}>
                                new game
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
