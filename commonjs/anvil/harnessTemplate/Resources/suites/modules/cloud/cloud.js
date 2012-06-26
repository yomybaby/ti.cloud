/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = new function() {
    var finish;
    var valueOf;
    var Cloud;
    this.init = function(testUtils) {
        finish = testUtils.finish;
        valueOf = testUtils.valueOf;
        Cloud = require('ti.cloud');
    };

    this.name = "cloud";
    this.tests = [
        {name: "cloudModule"},
        {name: "cloudUseSecure"}
    ];

    // ---------------------------------------------------------------
    // Cloud
    // ---------------------------------------------------------------

    // Test that cloud module is part of TiSDK
    this.cloudModule = function(testRun) {
        // Verify that the module is defined
        valueOf(testRun, Cloud).shouldBeObject();
        finish(testRun);
    },

    // Test the usage of the useSecure property
    this.cloudUseSecure = function(testRun) {
        // Verify default value of useSecure
        valueOf(testRun, Cloud.useSecure).shouldBeUndefined();
        // Verify useSecure property changes
        Cloud.useSecure = false;
        valueOf(testRun, Cloud.useSecure).shouldBeFalse();
        // Verify useSecure resets
        Cloud.useSecure = true;
        valueOf(testRun, Cloud.useSecure).shouldBeTrue();
        finish(testRun);
    }
}
