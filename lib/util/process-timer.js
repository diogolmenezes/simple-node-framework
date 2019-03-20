const Loggable = require('../base/loggable');

// Medir tempo de uma determinada rotina
// Ex.:
//   timer = new ProcessTimer();
//   start = timer.start();
//     do something here...
//   interval = timer.stop();
class ProcessTimer extends Loggable {
    constructor() {
        super({
            module: 'Process Timer'
        });
    }

    start() {
        return {
            timer: process.hrtime(),
            date: new Date()
        };
    }

    stop(start) {
        const interval = process.hrtime(start.timer);
        const nanoseconds = parseInt((interval[0] * 1e9) + interval[1]);
        const milliseconds = parseInt(nanoseconds / 1e6);
        const seconds = parseInt(nanoseconds / 1e9);

        return {
            seconds,
            milliseconds,
            nanoseconds,
            date: new Date()
        };
    }

    // Cria uma mensagem de log padrão para o tempo de resposta
    writeLog(start, featureName, extraMessage) {
        const interval = this.stop(start);
        this.log.debug(`Tempo de resposta ${featureName} ${extraMessage} [${interval.milliseconds} ms]`, {
            natural: {
                tempoDeResposta: interval.milliseconds,
                funcionalidade: featureName
            }
        });

        return interval;
    }
}

module.exports = ProcessTimer;
