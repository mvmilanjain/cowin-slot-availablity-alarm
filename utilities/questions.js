module.exports = {
    enterPinCodeForSearch: (rl) => (new Promise(resolve => {
        rl.question('Enter comma separated pin codes you are interested in: ', (pinCodes) => {
            pinCodes = pinCodes.split(',');
            resolve(pinCodes);
        });
    })),
    shouldContinueSearch: (rl) => (new Promise(resolve => {
        rl.question('You want to continue the search? (y/n): ', (answer) => {
            resolve(answer === '' || answer.toLowerCase() === 'y');
        });
    }))
}
