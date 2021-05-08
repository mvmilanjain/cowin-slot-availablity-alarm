const {axios} = require('./base.service');

module.exports = {
    getSessionByPincode: (params) => {
        return axios({
            url: '/appointment/sessions/public/calendarByPin',
            method: 'get',
            params
        });
    }
}


