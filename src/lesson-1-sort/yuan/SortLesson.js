import React from 'react';
import styled from 'react-emotion';
import erqiuBubbleSort from '../erqiu/bubbleSort';

const ArrayItem = styled('div')(({ beingSwapped, beingCompared }) => ({
    minWidth: 40,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    margin: '0px -1px 10px 0px',
    display: 'inline-block',
    padding: 10,
    backgroundColor: beingSwapped
        ? 'lightgreen'
        : (beingCompared ? 'yellow' : null),
}));

const ArrayVisualization = ({ array, onGoingAction, actionParams }) => {
    const isComparing = onGoingAction === 'compare';
    const isSwapping = onGoingAction === 'swap';

    return <div>
        {array.map((item, index) => {
            const beingCompared = isComparing && actionParams.indexOf(item.index) >= 0;
            const beingSwapped = isSwapping && actionParams.indexOf(item.index) >= 0;

            return <ArrayItem
                key={item.index}
                isFirst={index === 0}
                beingCompared={beingCompared}
                beingSwapped={beingSwapped}
            >
                {item.value}
            </ArrayItem>;
        })}
    </div>
}

async function yuanBubbleSort(length, lessThan, swap) {
    for (let lengthToSort = length; lengthToSort > 1;) {
        let lastSwapIndex = null;
        for (let j = 0; j < lengthToSort - 1; ++j) {
            const isInWrongOrder = await lessThan(j + 1, j);
            if (isInWrongOrder) {
                lastSwapIndex = j;
                await swap(j, j + 1);
            }
        }
        lengthToSort = lastSwapIndex + 1;
    }
}

const CommonButton = styled('button')({
    display: 'inline-block',
    margin: 10,
});

const StartButton = CommonButton;
const ToggleAlgorithmButton = CommonButton;

const WrappedPre = styled('pre')({
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    margin: 10,
});

const ErrorUI = ({ hasError, error }) => {
    if (!hasError) {
        return null;
    }

    return <div><h3>Error Message: {error.message}</h3><WrappedPre>{error.stack}</WrappedPre></div>;
}

const SortLesson = ({
     array, swap, lessThan,
     runAlgorithm, stopAlgorithm,
     algorithmToUse, toggleAlgorithmToUse,
     status, error, shuffle,
     onGoingAction, actionParams,
}) => {
    return <div>
        <h4>Status: {status}</h4>
        <ArrayVisualization
            array={array}
            onGoingAction={onGoingAction}
            actionParams={actionParams}
        />
        <div>
            { status !== 'running'
                ? <StartButton onClick={() =>
                    runAlgorithm(array.length, lessThan, swap)}
                >Start</StartButton>
                : <CommonButton onClick={stopAlgorithm}>Stop</CommonButton>
            }
            <ToggleAlgorithmButton onClick={toggleAlgorithmToUse}>
                Using {algorithmToUse === 'yuan' ? "yuan's algorithm" : "erqiu's algorithm"}
            </ToggleAlgorithmButton>
            <CommonButton onClick={shuffle}>
                Randomize
            </CommonButton>
            <ErrorUI hasError={status==='error'} error={error}/>
        </div>
    </div>;
};

function randomArray() {
    const newArray = [];
    const length = Math.ceil(Math.random() * 4) + 6;
    for (let i = 0; i < length; ++i) {
        newArray.push(Math.ceil(Math.random() * 10));
    }

    return newArray;
}

function expandArray(array) {
    const newArray = [];
    for (let i = 0; i < array.length; ++i) {
        newArray.push({
            value: array[i],
            index: i,
        });
    }

    return newArray;
}

class SortLessonContainer extends React.Component {
    state = {
        array: expandArray(randomArray()),
        delayMillis: 1000,
        algorithmToUse: 'erqiu',
        caughtError: null,
        status: 'initial',
        onGoingAction: null,
        actionParams: null,
    };

    setOnGoingAction = {
        clear: () => {
            this.setState({
                onGoingAction: null,
                actionParams: null,
            });
        },
        swapping: (i, j) => {
            this.setState({
                onGoingAction: 'swap',
                actionParams: [
                    this.state.array[i].index,
                    this.state.array[j].index
                ],
            });
        },
        comparing: (i, j) => {
            this.setState({
                onGoingAction: 'compare',
                actionParams: [
                    this.state.array[i].index,
                    this.state.array[j].index,
                ],
            });
        }
    };

    toggleAlgorithmToUse = () => {
        this.stopAlgorithm();
        this.setState(({ algorithmToUse }) => ({ algorithmToUse: algorithmToUse === 'yuan' ? 'erqiu' : 'yuan' }));
    };

    delay = (fn, immediateFn = null) => {
        return (...args) => {
            if (immediateFn) {
                immediateFn(...args);
            }

            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(fn(...args));
                    } catch (err) {
                        reject(err);
                    }
                }, this.state.delayMillis / 2);
            }).then(result => {
                return new Promise((resolve, reject) => {
                    setTimeout(
                        () => resolve(result),
                        this.state.delayMillis / 2
                    );
                });
            });
        }
    };

    checkIndexRangeOK = (index, name) => {
        if (index >=0 && index < this.state.array.length) {
            // ok
        } else {
            throw new Error(`index ${name} is out of range, current value is ${index}, should be in range [0, ${this.state.array.length})`);
        }
    }

    checkInterrupted = () => {
        if (this.state.status !== 'running') {
            const interruptError = new Error('interrupted');
            interruptError.interrupted = true;
            throw interruptError;
        }
    };

    swap = this.delay((i, j) => {
        this.checkInterrupted();

        this.checkIndexRangeOK(i, 'left of swap(left, right)');
        this.checkIndexRangeOK(j, 'right of swap(left, right)');
        console.log(`swapping #${i} and #${j}`)

        this.setState(({array}) => {
            const newArray = array.slice();
            const t = newArray[i];
            newArray[i] = newArray[j];
            newArray[j] = t;

            return {
                array: newArray,
            };
        });
    }, (i, j) => {
        this.setOnGoingAction.swapping(i, j);
    });

    lessThan = this.delay((i, j) => {
        this.checkInterrupted();

        this.checkIndexRangeOK(i, 'left of lessThan(left, right)');
        this.checkIndexRangeOK(j, 'right of lessThan(left, right)');

        const leftValue = this.state.array[i].value;
        const rightValue = this.state.array[j].value;
        const result = leftValue < rightValue;
        console.log(`comparing (#${i}, ${leftValue}) (#${j}, ${rightValue}) result: ${result}`);

        return result;
    }, (i, j) => {
        this.setOnGoingAction.comparing(i, j);
    });

    shuffle = () => {
        this.stopAlgorithm();
        this.setState({
            array: expandArray(randomArray()),
            status: 'initial',
        });
    };

    runAlgorithm = (...args) => {
        const algorithmToUse = this.state.algorithmToUse === 'yuan' ? yuanBubbleSort : erqiuBubbleSort;
        this.setState({
            status: 'running',
        });
        algorithmToUse(...args)
            .then(() => {
                this.setState({
                    status: 'complete',
                });
                this.setOnGoingAction.clear();
            })
            .catch(err => {
                if (err.interrupted) {
                    console.log('stopped');
                } else {
                    this.setOnGoingAction.clear();
                    this.setState({
                        caughtError: err,
                        status: 'error',
                    })
                }
            });
    };

    stopAlgorithm = () => {
        this.setOnGoingAction.clear();
        this.setState({
            status: 'initial',
        });
    };

    render() {
        return <SortLesson
          array={this.state.array}
          swap={this.swap}
          lessThan={this.lessThan}
          runAlgorithm={this.runAlgorithm}
          algorithmToUse={this.state.algorithmToUse}
          toggleAlgorithmToUse={this.toggleAlgorithmToUse}
          status={this.state.status}
          error={this.state.caughtError}
          shuffle={this.shuffle}
          stopAlgorithm={this.stopAlgorithm}
          onGoingAction={this.state.onGoingAction}
          actionParams={this.state.actionParams}
        />;
    }
}

export default () => {
    return <div><SortLessonContainer/></div>;
};
