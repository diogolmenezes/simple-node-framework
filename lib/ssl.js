const https = require('https');
const fs = require('fs');

function createAgent() {
    const ca = [];

    const domains = fs.readdirSync(`${process.cwd()}/_ssl`);

    domains.map(domain => {
        const files = fs.readdirSync(`${process.cwd()}/_ssl/${domain}`);
        const crtFiles = files.filter(file => file.match(/.*\.crt/ig));

        crtFiles.map(file => {
            ca.push(fs.readFileSync(`${process.cwd()}/_ssl/${domain}/${file}`));
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
