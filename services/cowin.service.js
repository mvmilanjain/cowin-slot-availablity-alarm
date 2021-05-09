const axios = require('axios');

const instance = axios.create({
    baseURL: 'https://cdn-api.co-vin.in/api/v2',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
    }
});

module.exports = {
    getSessionByPincode: (params) => {
        return instance({
            url: '/appointment/sessions/public/calendarByPin',
            method: 'get',
            params
        });
    }
}
