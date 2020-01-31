const https = require('https');
const fs = require('fs');

function createAgent() {
    const ca = [];

    const domains = fs.readdirSync(`${process.cwd()}/_ssl`);

    domains.map(domain => {
        ca.push(fs.readFileSync(`${process.cwd()}/_ssl/${domain}/leaf.crt`));
        ca.push(fs.readFileSync(`${process.cwd()}/_ssl/${domain}/inter.crt`));
        ca.push(fs.readFileSync(`${process.cwd()}/_ssl/${domain}/root.crt`));
    });

    return new https.Agent({
        rejectUnauthorized: true,
        ca
    });
}

const agent = createAgent();

module.exports = {
    agent,
    ca: agent.options.ca,
    applyCerts: () => {
        https.globalAgent.options.ca = agent.options.ca;
    }
};
