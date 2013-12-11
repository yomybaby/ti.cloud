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

  this.name = "cloud geo_fences";

  function verifyAPIs(testRun, namespace, functions) {
    for (var i = 0; i < functions.length; i++) {
      valueOf(testRun, Cloud[namespace][functions[i]]).shouldBeFunction();
    }
  }

  var adminUserId;

  // ---------------------------------------------------------------
  // Cloud.GeoFences
  // ---------------------------------------------------------------

  // Test that all of the namespace APIs are available
  this.testApi = function (testRun) {
    // Verify that all of the methods are exposed
    verifyAPIs(testRun, 'GeoFences', [
      'create',
      'update',
      'query',
      'remove'
    ]);
    finish(testRun);
  };

  // Log in for the following tests
  this.testLoginAdminUser = function (testRun) {
    var data = {
      login: 'admin',
      password: 'pass'
    };
    Cloud.Users.login(data, function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      adminUserId = e.users[0].id;
      finish(testRun);
    });
  };

  var geoFenceParams = {
    "geo_fence": "{\"loc\": {\"coordinates\":[0,0]}, \"payload\": \"created\", \"start_time\": \"2013-12-15T14:24\", \"end_time\": \"2013-12-25T14:24\"}"
  },
  updateGeoFenceParams = {
    "geo_fence": "{\"loc\": {\"coordinates\":[0,0], \"radius\":\"1000/200000\"}, \"payload\": \"updated\"}"
  };

  // Register for push notifications
  this.testCreateUpdateQueryGeoFence = function (testRun) {

    var created = function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      valueOf(testRun, e.geo_fences.length).shouldBe(1);
      valueOf(testRun, e.geo_fences[0].payload).shouldBe('created');
      updateGeoFenceParams.id = e.geo_fences[0].id;
      Cloud.GeoFences.update(updateGeoFenceParams, updated);
    };

    var queried = function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      valueOf(testRun, e.geo_fences.length).shouldBe(1);
      valueOf(testRun, e.geo_fences[0].payload).shouldBe('updated');
      finish(testRun);
    };

    var updated = function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      valueOf(testRun, e.geo_fences.length).shouldBe(1);
      valueOf(testRun, e.geo_fences[0].payload).shouldBe('updated');
      Cloud.GeoFences.query({}, queried);
    };

    Cloud.GeoFences.create(geoFenceParams, created);
  };

  this.testRemoveGeoFence = function(testRun) {
    Cloud.GeoFences.remove({
      id: updateGeoFenceParams.id
    }, function(e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      finish(testRun);
    });
  }

  // Done with the tests -- log out
  this.testLogoutAdminUser = function (testRun) {
    Cloud.Users.logout(function (e) {
      valueOf(testRun, e.success).shouldBeTrue();
      valueOf(testRun, e.error).shouldBeFalse();
      finish(testRun);
    });
  };

  // Populate the array of tests based on the 'hammer' convention
  this.tests = require('hammer').populateTests(this, 30000);
};
