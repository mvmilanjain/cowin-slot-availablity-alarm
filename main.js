const readline = require('readline');
const beep = require('beepbeep');

const {enterPinCodeForSearch, shouldContinueSearch} = require('./utilities/questions');
const {getSessionByPincode} = require('./services/cowin.service');

// Readline configuration
const rl = readline.createInterface({input: process.stdin, output: process.stdout});
rl.on("close", () => {
    console.log('Thanks for using this script. Bye Bye!!!');
    process.exit(0);
});

const getAvailableSlots = (params) => (new Promise(resolve => {
    getSessionByPincode(params).then(res => {
        const centers = res.data.centers;
        console.log(`Centers available in ${params.pincode} from ${params.date}: ${centers.length}`);
        const availableSlots = [];
        if (centers.length > 0) {
            centers.forEach(center => {
                let sessions = center.sessions;
                sessions.forEach(session => {
                    if (session.available_capacity >= 1 && session.min_age_limit <= 18) {
                        availableSlots.push({
                            'center_id': center['center_id'],
                            'name': center['name'],
                            'district': center['district_name'],
                            'pincode': center['pincode'],
                            'available': session['available_capacity'],
                            'date': session['date'],
                            'slots': session['slots'],
                            'min_age': session['min_age_limit'],
                            'vaccine': session['vaccine']
                        });
                    }
                });
            });
        }
        resolve(availableSlots);
    }).catch(error => resolve([]));
}));

const checkAppointmentAvailability = (pincodes) => (new Promise(resolve => {
    const todayStr = new Date().toLocaleDateString('en-IN');
    let availableAppointments = [];
    console.log(`==========================================================================`);
    let promises = pincodes.map(async pincode => {
        return await getAvailableSlots({pincode, date: todayStr});
    });
    Promise.all(promises).then(availableOptions => {
        availableOptions.forEach(option => {
            availableAppointments = [...availableAppointments, ...option];
        });
        resolve(availableAppointments);
    });
}));

const startTimer = () => (new Promise(resolve => {
    let timer = 10;
    let interval = setInterval(() => {
        process.stdout.write(`No viable options. Next update in ${timer} seconds..\r`);
        timer--;
        if (timer === 0) {
            clearInterval(interval);
            resolve(true);
        }
    }, 1000);
}));

const main = async () => {
    try {
        const pincodes = await enterPinCodeForSearch(rl);
        let availableOptions = [];
        let isContinue = true;
        while (isContinue) {
            availableOptions = await checkAppointmentAvailability(pincodes);
            if(availableOptions.length) {
                console.table(availableOptions);
                beep(Array(100).fill(100));
                isContinue = await shouldContinueSearch(rl);
            }
            isContinue && await startTimer();
        }
        rl.close();
    } catch (e) {
        console.error(e);
        rl.close();
    }
}
main();
