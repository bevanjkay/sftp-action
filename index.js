const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

let Client = require('ssh2-sftp-client');

const host = core.getInput('host');
const port = parseInt(core.getInput('port'));
const username = core.getInput('username');
const password = core.getInput('password');
const agent = core.getInput('agent');
const privateKeyIsFile = core.getInput('privateKeyIsFile');
const passphrase = core.getInput('passphrase');

var privateKey = core.getInput('privateKey');

core.setSecret(password);
if (passphrase != undefined) {
    core.setSecret(passphrase);
}

if (privateKeyIsFile == "true" && privateKey) {
    var privateKey = fs.readFileSync(privateKey);
    core.setSecret(privateKey);
}

const localPath = core.getInput('localPath');
const remotePath = core.getInput('remotePath');

const config = {
    host,
    port,
    username,
    password,
};

async function main() {
    const client = new Client();

    try {
        await client.connect(config);
        client.on('upload', info => {
            console.log(`Uploaded ${info.source}`);
        });
        let rslt = await client.uploadDir(localPath, remotePath);
        return rslt;
    } finally {
        client.end();
    }
}

main()
    .then(msg => {
        return console.log(msg);
    })
    .catch(err => {
        core.setFailed(`Action failed with error ${err}`);
        process.exit(1);
    });