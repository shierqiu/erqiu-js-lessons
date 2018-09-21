import React from 'react';
import styled from 'react-emotion';
import erqiuBubbleSort from '../erqiu/bubbleSort';

const ArrayItem = styled('div')(props => ({
    minWidth: 40,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'black',
    borderLeftStyle: props.isFirst ? 'solid' : 'none',
    display: 'inline-block',
    padding: 10,
}));

const ArrayVisualization = ({ array }) => {
    return <div>
        {array.map((item, index) =>
            <ArrayItem isFirst={index === 0} key={item}>{item}</ArrayItem>
        )}
    </div>
}

async function bubbleSort(length, lessThanOrEqual, swap) {
    for (let i = 0; i < length - 1; ++i) {
        for (let j = 0; j < length - i - 1; ++j) {
            const isLessThanOrEqual = await lessThanOrEqual(j + 1, j);
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

const SortLesson = ({ array, swap, lessThanOrEqual, algorithm, toggleAlgorithmToUse }) => {
    return <div>
        <ArrayVisualization array={array}/>
        <div>
        <StartButton onClick={() =>
            algorithm(array.length, lessThanOrEqual, swap)}
        >Start</StartButton>
        <ToggleAlgorithmButton onClick={toggleAlgorithmToUse}>
            Using {algorithm === bubbleSort ? "yuan's algorithm" : "erqiu's algorithm"}
        </ToggleAlgorithmButton>
        </div>
    </div>;
};

class SortLessonContainer extends React.Component {
    state = {
        array: [1, 5, 3, 2, 4],
        delayMillis: 1000,
        algorithmToUse: 'yuan',
    };

    toggleAlgorithmToUse = () => {
        this.setState(({ algorithmToUse }) => ({ algorithmToUse: algorithmToUse === 'yuan' ? 'erqiu' : 'yuan' }));
    };

    delay = (fn) => {
        return (...args) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(fn(...args));
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

    swap = this.delay((i, j) => {
        this.checkIndexRangeOK(i);
        this.checkIndexRangeOK(j);
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

    lessThanOrEqual = this.delay((i, j) => {
        this.checkIndexRangeOK(i);
        this.checkIndexRangeOK(j);
        console.log(`comparing #${i} #${j}`);

        return this.state.array[i] <= this.state.array[j];
    });

    render() {
        return <SortLesson
          array={this.state.array}
          swap={this.swap}
          lessThanOrEqual={this.lessThanOrEqual}
          algorithm={this.state.algorithmToUse === 'yuan' ? bubbleSort : erqiuBubbleSort}
          toggleAlgorithmToUse={this.toggleAlgorithmToUse}
        />;
    }
}

export default () => {
    return <div><SortLessonContainer/></div>;
};
