// this class has many helper methods
class Helper {
    // replace params in a string
    // ex.: resolveURL('http://google.com/profile/:id', {':id': cpf })
    static replaceWith(input, replace) {
        var new_value;
        for (let old_value in replace) {
            new_value = replace[old_value];
            input = input.replace(RegExp(old_value, "g"), new_value);
        }

        return input;
    }

    // retrieves the restify request id and returns without the traces "-"
    static requestId(req) {
        if (req && typeof req.id === "function") {
            req.id();
            return req._id.replace(/-/g, "");
        }
        return "";
    }
}

module.exports = Helper;
