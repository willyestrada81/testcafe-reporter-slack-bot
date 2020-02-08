'use strict';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var regeneratorRuntime = require("regenerator-runtime");

require('dotenv').config();

var axios = require('axios')["default"];

var token = process.env.SLACK_API_TOKEN;

module.exports = function () {
  return {
    currentFixtureName: null,
    report: {
      startTime: null,
      endTime: null,
      userAgents: null,
      passed: 0,
      total: 0,
      skipped: 0,
      fixtures: [],
      warnings: []
    },
    reportTaskStart: function reportTaskStart(startTime, userAgents, testCount) {
      var _this = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.report.startTime = startTime;
                _this.report.userAgents = userAgents;
                _this.report.total = testCount;
                _this.startTime = startTime;
                _this.testCount = testCount;

                _this.write("Running tests in: ".concat(userAgents)).newline();

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    reportFixtureStart: function reportFixtureStart(name, path, meta) {
      var _this2 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this2.currentFixture = {
                  name: name,
                  path: path,
                  meta: meta,
                  tests: []
                };

                _this2.report.fixtures.push(_this2.currentFixture);

                _this2.newline();

                _this2.currentFixtureName = name;

                _this2.write("".concat(_this2.currentFixtureName)).newline();

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    reportTestDone: function reportTestDone(name, testRunInfo, meta) {
      var _this3 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var errs, hasErr, result, title;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                errs = testRunInfo.errs.map(function (err) {
                  return _this3.formatError(err);
                });
                if (testRunInfo.skipped) _this3.report.skipped++;

                _this3.currentFixture.tests.push({
                  name: name,
                  meta: meta,
                  errs: errs,
                  durationMs: testRunInfo.durationMs,
                  unstable: testRunInfo.unstable,
                  screenshotPath: testRunInfo.screenshotPath,
                  skipped: testRunInfo.skipped
                });

                hasErr = !!testRunInfo.errs.length;
                result = hasErr ? '✖' : '✓';
                title = _this3.indentString("".concat(result, " ").concat(name.split('!')[0]), 4);

                if (hasErr) {
                  _this3.write(_this3.chalk.red("".concat(title))).newline();

                  testRunInfo.errs.forEach(function (err, idx) {
                    _this3.newline().write(_this3.formatError(err, _this3.chalk.red("".concat(idx + 1, ") ")))).newline();
                  });
                } else {
                  _this3.write(_this3.chalk.green("".concat(title))).newline();
                }

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    reportTaskDone: function reportTaskDone(endTime, passed, warnings) {
      var _this4 = this;

      return _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6() {
        var durationMs, durationStr, footer, block, fail, insertFixture, insertTest, insertErrors, generateMessage, msToTime, createResultBlock, messageData, sendToSlack;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _this4.report.passed = passed;
                _this4.report.endTime = endTime;
                _this4.report.warnings = warnings;
                durationMs = endTime - _this4.startTime;
                durationStr = _this4.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
                footer = passed === _this4.testCount ? "".concat(_this4.testCount, " passed") : "".concat(_this4.testCount - passed, "/").concat(_this4.testCount, " failed");
                footer += " (Duration: ".concat(durationStr, ")");

                _this4.write(footer).newline();

                block = [{
                  type: 'divider'
                }, {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: "*Running tests in:* \n \u276F ".concat(_this4.report.userAgents[0], "\n*Started at:*\n \u276F ").concat(_this4.report.startTime.toLocaleString(), "\n")
                  }
                }];
                fail = 0;

                insertFixture = function insertFixture(text) {
                  var fixture = {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: "*".concat(text, "* \n")
                    }
                  };
                  block.push(fixture);
                };

                insertTest = function insertTest(text) {
                  var errorsExist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Boolean;
                  var test = {};

                  if (errorsExist) {
                    test = {
                      type: 'section',
                      text: {
                        type: 'mrkdwn',
                        text: "\t :x: ".concat(text, " \n")
                      }
                    };
                  } else {
                    test = {
                      type: 'section',
                      text: {
                        type: 'mrkdwn',
                        text: "\t :white_check_mark: ".concat(text, " \n")
                      }
                    };
                  }

                  block.push(test);
                };

                insertErrors = function insertErrors(text) {
                  var testError = {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: '\t - `' + text + '`\n'
                    }
                  };
                  block.push(testError);
                };

                generateMessage =
                /*#__PURE__*/
                function () {
                  var _ref = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee4() {
                    var r, i, testsInFixture, n, err;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                      while (1) {
                        switch (_context4.prev = _context4.next) {
                          case 0:
                            _context4.next = 2;
                            return _this4.report;

                          case 2:
                            r = _context4.sent;

                            for (i = 0; i < r.fixtures.length; i++) {
                              insertFixture(r.fixtures[i].name);
                              testsInFixture = r.fixtures[i].tests.length;

                              for (n = 0; n < testsInFixture; n++) {
                                durationMs += r.fixtures[i].tests[n].durationMs;
                                err = r.fixtures[i].tests[n].errs;

                                if (err.length > 0) {
                                  insertTest(r.fixtures[i].tests[n].name, true);
                                  err.forEach(function (error) {
                                    return insertErrors(error);
                                  });
                                  fail += 1;
                                } else insertTest(r.fixtures[i].tests[n].name, false);
                              }
                            }

                          case 4:
                          case "end":
                            return _context4.stop();
                        }
                      }
                    }, _callee4);
                  }));

                  return function generateMessage() {
                    return _ref.apply(this, arguments);
                  };
                }();

                msToTime = function msToTime(duration) {
                  var seconds = parseInt(duration / 1000 % 60, 10);
                  var minutes = parseInt(duration / (1000 * 60) % 60, 10);
                  var hours = parseInt(duration / (1000 * 60 * 60) % 24, 10);
                  hours = hours < 10 ? '0' + hours : hours;
                  minutes = minutes < 10 ? '0' + minutes : minutes;
                  seconds = seconds < 10 ? '0' + seconds : seconds;
                  return hours + ':' + minutes + ':' + seconds;
                };

                createResultBlock = function createResultBlock() {
                  block.push({
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: ":tada: *".concat(passed, " Passed*\n:thumbsdown: *").concat(fail, " Failed*\n* \u276F Completed at:*\t").concat(endTime.toLocaleString(), "\n* \u276F Duration:*\t").concat(durationStr, "\n")
                    }
                  }, {
                    type: 'divider'
                  });
                };

                messageData = {
                  blocks: block
                };

                sendToSlack =
                /*#__PURE__*/
                function () {
                  var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee5() {
                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.t0 = axios;
                            _context5.t1 = "https://hooks.slack.com/services/".concat(token);
                            _context5.t2 = {
                              'Content-type': 'application/json'
                            };
                            _context5.next = 5;
                            return messageData;

                          case 5:
                            _context5.t3 = _context5.sent;
                            _context5.t4 = {
                              method: 'post',
                              url: _context5.t1,
                              headers: _context5.t2,
                              data: _context5.t3
                            };
                            (0, _context5.t0)(_context5.t4);

                          case 8:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  }));

                  return function sendToSlack() {
                    return _ref2.apply(this, arguments);
                  };
                }();

                _context6.next = 20;
                return generateMessage();

              case 20:
                _context6.next = 22;
                return createResultBlock();

              case 22:
                _context6.next = 24;
                return sendToSlack();

              case 24:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }))();
    }
  };
};