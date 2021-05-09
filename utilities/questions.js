module.exports = {
    userInfo: [
        {
            type: 'list',
            name: 'pincodes',
            message: 'Enter comma separated pin codes you are interested in: '
        },
        {
            type: 'select',
            name: 'minAgeLimit',
            message: 'Select minimum age limit',
            choices: [
                {title: 'Age 18+', value: 18},
                {title: 'Age 45+', value: 45}
            ]
        },
        {
            type: 'number',
            name: 'minSlot',
            message: 'Enter minimum available slots: ',
            initial: 1,
            validate: value => value < 1 || value > 100 ? 'Please enter between 1 to 100' : true
        }
    ],
    shouldContinueSearch: {
        type: 'confirm',
        name: 'confirmed',
        message: 'You want to continue the search?'
    }
}
