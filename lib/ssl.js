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

module.exports = {
    applyCerts: () => {
        const agent = createAgent();
        https.globalAgent.options.ca = agent.options.ca;
        return agent;
    }
};
