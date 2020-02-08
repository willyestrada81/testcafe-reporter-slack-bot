'use strict';
const regeneratorRuntime = require("regenerator-runtime");
require('dotenv').config();
const axios = require('axios').default;
const token = process.env.SLACK_API_TOKEN;

module.exports = () => ({
    currentFixtureName: null,
    report:             {
        startTime:  null,
        endTime:    null,
        userAgents: null,
        passed:     0,
        total:      0,
        skipped:    0,
        fixtures:   [],
        warnings:   []
    },

    async reportTaskStart (startTime, userAgents, testCount) {
        this.report.startTime  = startTime;
        this.report.userAgents = userAgents;
        this.report.total      = testCount;
        this.startTime = startTime;
        this.testCount = testCount;

        this.write(`Running tests in: ${userAgents}`)
            .newline();
    },

    async reportFixtureStart (name, path, meta) {
        this.currentFixture = { name: name, path: path, meta: meta, tests: [] };
        this.report.fixtures.push(this.currentFixture);
        this.newline();
        this.currentFixtureName = name;
        this.write(`${this.currentFixtureName}`)
            .newline();
    },

    async reportTestDone (name, testRunInfo, meta) {
        var errs = testRunInfo.errs.map(err => this.formatError(err));
            
        if (testRunInfo.skipped)
            this.report.skipped++;

        this.currentFixture.tests.push({
            name: name,
            meta: meta,
            errs: errs,

            durationMs:     testRunInfo.durationMs,
            unstable:       testRunInfo.unstable,
            screenshotPath: testRunInfo.screenshotPath,
            skipped:        testRunInfo.skipped
        });
      
        const hasErr = !!testRunInfo.errs.length;

        const result = hasErr ? '✖' : '✓';

        const title = this.indentString(`${result} ${name.split('!')[0]}`, 4);

        if (hasErr) {
            this.write(this.chalk.red(`${title}`))
                .newline();
            testRunInfo.errs.forEach((err, idx) => {
                this.newline()
                    .write(this.formatError(err, this.chalk.red(`${idx + 1}) `)))
                    .newline();
            });
        }
        else {
            this.write(this.chalk.green(`${title}`))
                .newline();
        }
    },

    async reportTaskDone (endTime, passed, warnings) {
        this.report.passed   = passed;
        this.report.endTime  = endTime;
        this.report.warnings = warnings;
        let durationMs = endTime - this.startTime;
        const durationStr = this.moment
            .duration(durationMs)
            .format('h[h] mm[m] ss[s]');

        let footer = passed === this.testCount
            ? `${this.testCount} passed`
            : `${this.testCount - passed}/${this.testCount} failed`;

        footer += ` (Duration: ${durationStr})`;

        this.write(footer)
            .newline();

        const block = [{
            type: 'divider'
        }, {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Running tests in:* \n ❯ ${this.report.userAgents[0]}\n*Started at:*\n ❯ ${this.report.startTime.toLocaleString()}\n`
            }
        }];

        let fail = 0;

        const insertFixture = (text) => {
            const fixture = {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*${text}* \n`
                }
            };
            
            block.push(fixture);
        };
        const insertTest = (text, errorsExist = Boolean) => {
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
            
            block.push(test);
        };
        const insertErrors = (text) => {
            const testError = {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '\t - `'+ text + '`\n'
                }
            };
            
            block.push(testError);
        };
        const generateMessage = async () => {
            const r = await this.report;
            for (let i = 0; i < r.fixtures.length; i++) {
                insertFixture(r.fixtures[i].name);
                const testsInFixture = r.fixtures[i].tests.length; 
            
                for (let n = 0; n < testsInFixture; n++) {
                    durationMs += r.fixtures[i].tests[n].durationMs;
                    const err = r.fixtures[i].tests[n].errs;
            
                    if (err.length > 0) {
                        insertTest(r.fixtures[i].tests[n].name, true);
                        err.forEach(error => insertErrors(error));
                        fail += 1;
                    }
                    else insertTest(r.fixtures[i].tests[n].name, false);
                }
            }
        };
        const msToTime = (duration) => {
            let seconds = parseInt(duration / 1000 % 60, 10);
            
            let minutes = parseInt(duration / (1000 * 60) % 60, 10);
            
            let hours = parseInt(duration / (1000 * 60 * 60) % 24, 10);
            
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            return hours + ':' + minutes + ':' + seconds;
        };
        const createResultBlock = () => {
            block.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `:tada: *${passed} Passed*\n:thumbsdown: *${fail} Failed*\n* ❯ Completed at:*\t${endTime.toLocaleString()}\n* ❯ Duration:*\t${durationStr}\n`
                }
            }, {
                type: 'divider'
            });
        };
        const messageData = {
            blocks: block
        };
        const sendToSlack = async () => {
            axios({
                method:  'post',
                url:     `https://hooks.slack.com/services/${token}`,
                headers: {
                    'Content-type': 'application/json'
                },
                
                data: await messageData
            });
        };
            
        await generateMessage();
        await createResultBlock();
        await sendToSlack();
    }
});
