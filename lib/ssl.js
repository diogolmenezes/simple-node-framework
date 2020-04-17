const https = require('https');
const fs = require('fs');
const logger = require('./log').instance;

function createAgent() {
    const ca = [];

    const domains = fs.readdirSync(`${process.cwd()}/_ssl`);

    domains.map(domain => {
        const files = fs.readdirSync(`${process.cwd()}/_ssl/${domain}`);
        const certFiles\ = files.filter(file => file.match(/.*\.(crt|pem)/ig));

        certFiles\.map(file => {
            const path = `${process.cwd()}/_ssl/${domain}/${file}`
            logger.info('SNF SSL =>', `Adding ssl cert [${path}]`);

            ca.push(fs.readFileSync(path));
        });
    });

    return new https.Agent({
        rejectUnauthorized: true,
        ca
    });
}

module.exports = {
    applyCerts: () => {
        const agent = createAgent();
        https.globalAgent.options.ca = agent.options.ca;
        return agent;
    }
};
