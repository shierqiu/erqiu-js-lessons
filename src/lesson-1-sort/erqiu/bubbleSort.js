async function bubbleSort(length, isLessThan, swap) {
    // write your code here

    // for comparing
    // const compareResult = await isLessThan(i, j);

    // for swapping items
    // await swap(i, j)

    // for loop
    // for (let i = 0; i < 3; i = i + 1) {
    //     await isLessThan(i, i + 1)
    // }

    // if statement
    // const isNoGreater = await isLessThan(0, 1)
    // if (isNoGreater) {
    //     await swap(1, 2)
    // }

    let i, j;
    for (j = 0; j < length ; j = j + 1) {
        for (i = 0; i < length - 1 - j; i = i + 1) {
            if (await isLessThan(i + 1, i)) {
                await swap(i, i + 1)
            }
        }
    }

    // const compareResult = await isLessThan(1, 3)
    // console.log(compareResult)

    // await swap(1, 3)

    // const compareResult2 = await isLessThan(3, 4)
    // console.log(compareResult2)

    // await swap (3,4)
}

export default bubbleSort;
