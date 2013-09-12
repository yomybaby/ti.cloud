/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

/*
  in order to test this, you need to create an admin user from acs web console of useranme/password => admin/pass
 */
module.exports = new function () {
  var finish;
  var valueOf;
  var Cloud;
  this.init = function (testUtils) {
    finish = testUtils.finish;
    valueOf = testUtils.valueOf;
    Cloud = require('ti.cloud');
  };

  this.name = "cloud push schedules";

  function verifyAPIs(testRun, namespace, functions) {
    for (var i = 0; i < functions.length; i++) {
      valueOf(testRun, Cloud[namespace][functions[i]]).shouldBeFunction();
    }
  }

  var drillbitUserId;

  // ---------------------------------------------------------------
  // Cloud.PushSchedules
  // ---------------------------------------------------------------

  // Test that all of the namespace APIs are available
  this.testApi = function (testRun) {
    // Verify that all of the methods are exposed
    verifyAPIs(testRun, 'PushSchedules', [
      'create',
      'query',
      'remove'
    ]);
    finish(testRun);
  };

  // Log in for the following tests
  this.testLoginDrillbitUser = function (testRun) {
    var data = {
      login:'admin',
      password:'pass'
    };
    Cloud.Users.login(data, function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      drillbitUserId = e.users[0].id;
      finish(testRun);
    });
  };

  // Register for push notifications
  this.testCreatePushSchedule = function (testRun) {
    var schedule = {
      name: 'push schedule',
      start_time: '2015-09-05T10:11',
      recurrence: {
        interval: 10,
        end_time: '2015-09-10T10:11'
      },
      push_notification: {
        payload: "hello world",
        channel: "channelOne"
      }
    };

    var created = function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      valueOf(testRun, e.push_schedules.length).shouldBe(1);
      valueOf(testRun, e.push_schedules[0].name).shouldBe('push schedule');
      Cloud.PushSchedules.query({}, queried);
    };

    var queried = function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      valueOf(testRun, e.push_schedules.length).shouldBe(1);
      valueOf(testRun, e.push_schedules[0].name).shouldBe('push schedule');
      Cloud.PushSchedules.remove({
        ids: e.push_schedules[0].id
      }, removed);
    };

    var removed = function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      finish(testRun);
    };

    Cloud.PushSchedules.create({
      schedule: JSON.stringify(schedule)
    }, created);
  };

  // Done with the tests -- log out
  this.testLogoutDrillbitUser = function (testRun) {
    Cloud.Users.logout(function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      finish(testRun);
    });
  };

  // Populate the array of tests based on the 'hammer' convention
  this.tests = require('hammer').populateTests(this, 30000);
};
