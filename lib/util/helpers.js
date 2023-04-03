// this class has many helper methods
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

    // retrieves the restify request id and returns without the traces "-"
    static requestId(req) {
        if(req && req.headers && req.headers['request_id']) {
            return req.headers['request_id'];
        }

        if (req && typeof req.id === 'function') {
            req.id();
            return req._id.replace(/-/g, '');
        }
        return '';
    }
}

module.exports = Helper;
