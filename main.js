const {prompt} = require('prompts');
const beep = require('beepbeep');

const {getSessionByPincode} = require('./services/cowin.service');
const {userInfo, shouldContinueSearch} = require('./utilities/questions');

const checkAppointmentAvailability = (pincodes, minAgeLimit, minSlot) => (new Promise(resolve => {
    const todayStr = new Date().toLocaleDateString('en-IN');
    let availableAppointments = [];
    console.log(`==========================================================================`);
    let promises = pincodes.map(async pincode => {
        return await getAvailableSlots({pincode, date: todayStr}, minAgeLimit, minSlot);
    });
    Promise.all(promises).then(availableOptions => {
        availableOptions.forEach(option => {
            availableAppointments = [...availableAppointments, ...option];
        });
        resolve(availableAppointments);
    });
}));

const getAvailableSlots = (params, minAgeLimit, minSlot) => (new Promise(resolve => {
    getSessionByPincode(params).then(res => {
        const {centers} = res.data;
        console.log(`Centers available in ${params.pincode} from ${params.date}: ${centers.length}`);
        const availableSlots = [];
        if (centers.length > 0) {
            centers.forEach(center => {
                let sessions = center.sessions;
                sessions.forEach(session => {
                    if (session.available_capacity >= minSlot && session.min_age_limit <= minAgeLimit) {
                        availableSlots.push({
                            'center_id': center['center_id'],
                            'name': center['name'],
                            'district_name': center['district_name'],
                            'pincode': center['pincode'],
                            'available_capacity': session['available_capacity'],
                            'date': session['date'],
                            'slots': session['slots'],
                            'min_age_limit': session['min_age_limit'],
                            'vaccine': session['vaccine']
                        });
                    }
                });
            });
        }
        resolve(availableSlots);
    }).catch(error => {
        console.warn(`ERROR: Not able to fetch centers for ${param.pincode}`);
        resolve([])
    });
}));

const startTimer = (timer = 10) => (new Promise(resolve => {
    let interval = setInterval(() => {
        process.stdout.write(`No viable options available. Next update in ${timer} seconds..\r`);
        timer--;
        if (timer === 0) {
            clearInterval(interval);
            resolve(true);
        }
    }, 1000);
}));

(async () => {
    try {
        const {pincodes, minAgeLimit, minSlot = 1, refreshFreq = 10} = await prompt(userInfo);
        let isContinue = true;
        while (isContinue) {
            let availableOptions = await checkAppointmentAvailability(pincodes, minAgeLimit, minSlot);
            if (availableOptions.length) {
                console.table(availableOptions);
                beep(Array(200).fill(100));
                let answer = await prompt(shouldContinueSearch);
                isContinue = answer.confirmed;
                if(!isContinue) {
                    console.log('Thanks for using this script. Bye Bye!!!');
                    process.exit(0);
                }
            } else {
                isContinue && await startTimer(refreshFreq);
            }
        }
    } catch (e) {
        console.error(e);
    }
})();
