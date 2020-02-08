# testcafe-reporter-slack-bot
[![Build Status](https://travis-ci.org/willy.estrada81@gmail.com/testcafe-reporter-slack-bot.svg)](https://travis-ci.org/willy.estrada81@gmail.com/testcafe-reporter-slack-bot)

This is the **slack-bot** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

<p align="center">
    <img src="https://raw.github.com/willy.estrada81@gmail.com/testcafe-reporter-slack-bot/master/media/preview.png" alt="preview" />
</p>

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
