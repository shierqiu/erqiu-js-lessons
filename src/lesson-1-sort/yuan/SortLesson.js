import React from 'react';
import styled from 'react-emotion';
import erqiuBubbleSort from '../erqiu/bubbleSort';

const ArrayItem = styled('div')(props => ({
    minWidth: 40,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    margin: '0px -1px 10px 0px',
    display: 'inline-block',
    padding: 10,
}));

const ArrayVisualization = ({ array }) => {
    return <div>
        {array.map((item, index) =>
            <ArrayItem key={item.index} isFirst={index === 0}>{item.value}</ArrayItem>
        )}
    </div>
}

async function bubbleSort(length, lessThan, swap) {
    for (let i = 0; i < length - 1; ++i) {
        for (let j = 0; j < length - i - 1; ++j) {
            const isLessThanOrEqual = await lessThan(j + 1, j);
            console.log(length, i, j, isLessThanOrEqual);
            if (!isLessThanOrEqual) {
                await swap(j, j + 1);
            }
        }
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
     status, error, shuffle 
}) => {
    return <div>
        <h4>Status: {status}</h4>
        <ArrayVisualization array={array}/>
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
    };

    toggleAlgorithmToUse = () => {
        this.setState(({ algorithmToUse }) => ({ algorithmToUse: algorithmToUse === 'yuan' ? 'erqiu' : 'yuan' }));
    };

    delay = (fn) => {
        return (...args) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(fn(...args));
                    } catch (err) {
                        reject(err);
                    }
                }, this.state.delayMillis);
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
    });

    shuffle = () => {
        this.setState({
            array: expandArray(randomArray()),
            status: 'initial',
        });
    };

    runAlgorithm = (...args) => {
        const algorithmToUse = this.state.algorithmToUse === 'yuan' ? bubbleSort : erqiuBubbleSort;
        this.setState({
            status: 'running',
        });
        algorithmToUse(...args)
            .then(() => {
                this.setState({
                    status: 'complete',
                });
            })
            .catch(err => {
                if (err.interrupted) {
                    console.log('stopped');
                } else {
                    this.setState({
                        caughtError: err,
                        status: 'error',
                    })
                }
            });
    };

    stopAlgorithm = () => {
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
        />;
    }
}

export default () => {
    return <div><SortLessonContainer/></div>;
};
