const Loggable = require('../base/loggable');

// Measure time for a given routine
// Ex.:
//   timer = new ProcessTimer();
//   start = timer.start();
//     do something here...
//   interval = timer.stop();
class ProcessTimer extends Loggable {
    constructor() {
        super({
            module: 'SNF Process Timer'
        });
    }

    // start the timer
    start() {
        return {
            timer: process.hrtime(),
            date: new Date()
        };
    }

    // stop the timer
    stop(start) {
        const interval = process.hrtime(start.timer);
        const nanoseconds = parseInt(interval[0] * 1e9 + interval[1]);
        const milliseconds = parseInt(nanoseconds / 1e6);
        const seconds = parseInt(nanoseconds / 1e9);

        return {
            seconds,
            milliseconds,
            nanoseconds,
            date: new Date()
        };
    }

    // creates a default log message for response time
    writeLog(start, featureName, extraMessage) {
        const interval = this.stop(start);
        this.log.debug(`Responset time ${featureName} ${extraMessage} [${interval.milliseconds} ms]`, {
            natural: {
                responseTime: interval.milliseconds,
                feature: featureName
            }
        });

        return interval;
    }
}

module.exports = ProcessTimer;
