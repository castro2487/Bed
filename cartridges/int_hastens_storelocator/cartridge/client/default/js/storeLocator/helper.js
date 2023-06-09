var dayjs = require("dayjs");

function isMyScriptLoaded(url) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length; i--;) {
        if (scripts[i].src == url) return true;
    }
    return false;
}

function getScheduleWithDeviations(storeHours = {}) {
    var scheduleKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var schedule = [];

    for (var index = 0; index < 7; index++) {
        var date = dayjs().add(index, 'day').format('YYYY-MM-DD');
        var weekdayIndex = dayjs().add(index, 'day').format('d');
        var weekday = scheduleKeys[weekdayIndex];

        var override = (storeHours.overrides || []).find((item) => {
            return dayjs(item.date, 'YYYY-MM-DD').isSame(dayjs().add(index, 'day'), 'date');
        });

        schedule.push({
            date,
            hours: (override || {}).hours || (storeHours.schedule || {})[weekday] || [],
        });
    }

    return schedule;
}

module.exports = {
    isMyScriptLoaded: isMyScriptLoaded,
    getScheduleWithDeviations: getScheduleWithDeviations
}
