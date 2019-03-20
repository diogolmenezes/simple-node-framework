class Helper {
    static replaceWith(input, replace) {
        var new_value;
        for (let old_value in replace) {
            new_value = replace[old_value];
            input = input.replace(RegExp(old_value, 'g'), new_value);
        }

        return input;
    }

    static validateCPF(_cpf) {
        let j = -1;
        let i;
        let add;
        let rev;

        const cpf = _cpf.replace(/[^\d]+/g, '');

        if (cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        while (++j < 2) {
            add = 0;
            i = -1;

            while (++i < (9 + j)) {
                add += (cpf[i] >>> 0) * ((10 + j) - i);
            }

            rev = 11 - (add % 11);

            if (rev === 10 || rev === 11) {
                rev = 0;
            }

            if (rev !== cpf[9 + j] >>> 0) {
                return false;
            }
        }

        return true;
    }

    // recupera o request id do restify e devolve sem os traços
    static requestId(req) {
        if(req && typeof(req.id) === 'function')
        {
            req.id();
            return req._id.replace(/-/g, '');
        }
        return '';
    }
}

module.exports = Helper;
