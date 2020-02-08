
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

    reportTaskStart (startTime, userAgents, testCount) {
        this.startTime = startTime;
        this.testCount = testCount;

        this.write(`Running tests in: ${userAgents}`)
            .newline();
    },

    reportFixtureStart (name) {
        this.newline();
        this.currentFixtureName = name;
        this.write(`${this.currentFixtureName}`)
            .newline();
    },

    reportTestDone (name, testData) {
        const hasErr = !!testData.errs.length;

        const result = hasErr ? '✖' : '✓';

        const title = this.indentString(`${result} ${name.split('!')[0]}`, 4);

        if (hasErr) {
            this.write(this.chalk.red(`${title}`))
                .newline();
            testData.errs.forEach((err, idx) => {
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

    reportTaskDone (endTime, passed) {
        const durationMs = endTime - this.startTime;
        const durationStr = this.moment
            .duration(durationMs)
            .format('h[h] mm[m] ss[s]');

        let footer = passed === this.testCount
            ? `${this.testCount} passed`
            : `${this.testCount - passed}/${this.testCount} failed`;

        footer += ` (Duration: ${durationStr})`;

        this.write(footer)
            .newline();

        try {
            const slack = require('./slack');
    
            const Slack = slack.Slack;
    
            const slackBot = new Slack(this.report);
    
            slackBot.generateMessage();
            slackBot.createResultBlock();
            slackBot.sendToSlack();
    
                
        }
        catch (err) {
            console.log(err);
        }
    }
});
