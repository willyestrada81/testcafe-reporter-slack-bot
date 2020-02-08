# testcafe-reporter-slack-bot
[![Build Status](https://travis-ci.org/willy.estrada81@gmail.com/testcafe-reporter-slack-bot.svg)](https://travis-ci.org/willy.estrada81@gmail.com/testcafe-reporter-slack-bot)

This is the **slack-bot** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/willy.estrada81@gmail.com/testcafe-reporter-slack-bot/master/media/preview.png" alt="preview" />
</p>

## Requirements

You must register for a slack account and create and configure an app. Go to [Slack](https://api.slack.com/apps) and follow the instructions. You'll get a token that will need to be put in an .env file in your project root directory in this format:

```
SLACK_API_TOKEN = {YOUR SLACK API TOKEN HERE}
```

## Install

```
npm install testcafe-reporter-slack-bot
```

## Usage

When you run tests from the command line, specify the reporter name by using the `--reporter` option:

```
testcafe chrome 'path/to/test/file.js' --reporter slack-bot
```


When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('slack-bot') // <-
    .run();
```

## Author
William Estrada 
