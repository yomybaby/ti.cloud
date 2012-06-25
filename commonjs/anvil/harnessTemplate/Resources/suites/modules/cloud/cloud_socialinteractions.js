/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */
 
module.exports = new function() {
	var finish;
	var valueOf;
	this.init = function(testUtils) {
		finish = testUtils.finish;
		valueOf = testUtils.valueOf;
	};

	this.name = "cloud social interactions";
	this.tests = [
		{name: "Api"}
    ];

    var Cloud = require('ti.cloud');
    //Cloud && (Cloud.debug = true);

    function verifyAPIs(testRun, namespace, functions) {
        for (var i = 0; i < functions.length; i++) {
            valueOf(testRun, Cloud[namespace][functions[i]]).shouldBeFunction();
        }
    };

    // ---------------------------------------------------------------
    // Cloud.SocialIntegrations
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    this.Api = function(testRun) {
        // Verify that all of the methods are exposed
        verifyAPIs(testRun, 'SocialIntegrations', [
            'externalAccountLogin',
            'externalAccountLink',
            'externalAccountUnlink',
            'searchFacebookFriends'
        ]);
        finish(testRun);
    }

    // NOTE: Further testing of Cloud.SocialIntegrations requires manual testing
    // as it relies on the creation of an external social network account
}
