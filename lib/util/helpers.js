// this class has many helper methods
const config = require('../config');
class Helper {
    // replace params in a string
    // ex.: resolveURL('http://google.com/profile/:id', {':id': cpf })
    static replaceWith(input, replace) {
        let newValue;
        let output = input;

        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */

        for (const oldValue in replace) {
            newValue = replace[oldValue];
            output = input.replace(RegExp(oldValue, 'g'), newValue);
        }
        /* eslint-enable */

        return output;
    }

    // retrieves the request_id from header or restify request id and returns without the traces "-"
    static requestId(req) {
        let requestIdentifier = 'request_id';
        const configRequestIdetifier = config.log.requestIdentifier;

        if (configRequestIdetifier?.length > 0) {
            requestIdentifier = configRequestIdetifier;
        }

        const requestId = req.headers[requestIdentifier];

        if (requestId) {
            return requestId;
        }

        if (req && typeof req.id === 'function') {
            req.id();
            return req._id.replace(/-/g, '');
        }
        return '';
    }
}

module.exports = Helper;
