// this class its used to show memory use information
class Memory {
    // show memory use information
    static show() {
        const { rss, heapUsed, heapTotal } = process.memoryUsage();
        console.log('RSS: ', Memory.bytesToSize(rss, 3), 'and Heap:', Memory.bytesToSize(heapUsed, 3), 'of', Memory.bytesToSize(heapTotal, 3), 'total');
    }

    // show memory use information in a interval
    // on use this method remember to call clearInterval ate the end
    // let interval = Memory.follow();
    //
    // process.on('SIGINT', () => {
    //     clearInterval(interval);
    // });
    //
    static follow(timeout = 5000) {
        console.log('================');
        console.log('  Memory Usage  ');
        console.log('================');
        return setInterval(() => {
            Memory.show();
        }, timeout);
    }

    // convert bytes to size
    static bytesToSize(input, precision) {
        const unit = ['', 'K', 'M', 'G', 'T', 'P'];
        const index = Math.floor(Math.log(input) / Math.log(1024));
        if (unit >= unit.length) return `${input}B`;
        return `${((input / 1024) ** index).toFixed(precision)} ${unit[index]}B`;
    }
}

module.exports = Memory;
