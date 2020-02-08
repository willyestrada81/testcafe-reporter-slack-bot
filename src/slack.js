require('dotenv').config();


const axios = require('axios').default;

const token = process.env.SLACK_API_TOKEN;

export default class Slack {
    constructor (report) {
        this.startTime = report.startTime;
        this.endTime = report.endTime;
        this.userAgents = report.userAgents;
        this.passed = report.passed;
        this.total = report.total;
        this.skipped = report.skipped;
        this.fixtures = report.fixture;
        this.warnings = report.warnings;
        this.block = [{
            type: 'divider'
        }, {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Running tests in:* \n ❯ ${this.userAgents[0]}\n*Started at:*\n ❯ ${this.startTime.toLocaleString()}\n`
            }
        }];
        this.messageData = {
            blocks: this.block
        };
        this.fail = 0;
        this.durationMs = 0;
    }

    async generateMessage () {
        for (let i = 0; i < this.fixtures.length; i++) {
            await this.insertFixture(this.fixtures[i].name);
            const testsInFixture = this.fixtures[i].tests.length; // console.log(report.fixtures[i].name)

            for (let n = 0; n < testsInFixture; n++) {
                // console.log(report.fixtures[i].tests[n].name)
                this.durationMs += this.fixtures[i].tests[n].durationMs;
                const err = this.fixtures[i].tests[n].errs;

                if (err.length > 0) {
                    await this.insertTest(this.fixtures[i].tests[n].name, true);
                    err.forEach(error => this.insertErrors(error));
                    this.fail += 1;
                }
                else await this.insertTest(this.fixtures[i].tests[n].name, false);
            }
        }
    }

    async insertFixture (text) {
        const fixture = {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*${text}* \n`
            }
        };

        this.block.push(fixture);
    }

    async insertTest (text, errorsExist = Boolean) {
        let test = {};

        if (errorsExist) {
            test = {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `\t :x: ${text} \n`
                }
            };
        }
        else {
            test = {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `\t :white_check_mark: ${text} \n`
                }
            };
        }

        this.block.push(test);
    }

    async insertErrors (text) {
        const testError = {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `\t - ${text.substr(0, text.indexOf('Browser'))} \n`
            }
        };

        this.block.push(testError);
    }

    async createResultBlock () {
        this.block.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `:tada: *${this.passed} Passed*\n:thumbsdown: *${this.fail} Failed*\n* ❯ Completed at:*\t${this.endTime.toLocaleString()}\n* ❯ Duration:*\t${this.msToTime(this.durationMs)}\n`
            }
        }, {
            type: 'divider'
        });
    }

    async sendToSlack () {
        axios({
            method:  'post',
            url:     `https://hooks.slack.com/services/${token}`,
            headers: {
                'Content-type': 'application/json'
            },
            data: this.messageData
        });
    }

    async msToTime (duration) {
        let seconds = parseInt(duration / 1000 % 60, 10);

        let minutes = parseInt(duration / (1000 * 60) % 60, 10);

        let hours = parseInt(duration / (1000 * 60 * 60) % 24, 10);

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return hours + ':' + minutes + ':' + seconds;
    }

}
