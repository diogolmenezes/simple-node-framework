const Base = require("./base");
const xml2js = require("xml2js");
const soap = require("soap");
const fetch = require("node-fetch");
const ProxyAgent = require("https-proxy-agent");

// this class adds base and soap functionalities to soap classes
class BaseSoap extends Base {
    constructor({ module }) {
        super({
            module
        });

        this.fetch = fetch;
        this.xml_parser = xml2js.parseString;
        this.soap = soap;
    }

    // create soap client
    createClient(wsdl, endpoint) {
        return new Promise((resolve, reject) => {
            this.soap.createClient(wsdl, endpoint, (err, client) => {
                if (err) reject(err);
                else resolve(client);
            });
        });
    }

    // parse xml
    parseXml(xml, explicitArray = true) {
        return new Promise((resolve, reject) => {
            this.xml_parser(xml, { explicitArray }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // send a post to url
    send(url, request, timeout, proxy, explicitArray = true) {
        const options = {};
        options.method = "POST";
        options.body = request;
        options.headers = {
            "Content-Type": "text/xml; charset=utf-8",
            "Content-Length": request.length
        };

        options.timeout = timeout * 1000 || 8000;
        options.agent = proxy ? new ProxyAgent(proxy) : null;

        return this.fetch(url, options)
            .then(response => {
                return response.text();
            })
            .then(xml => {
                return this.parseXml(xml, explicitArray);
            });
    }
}

module.exports = BaseSoap;
