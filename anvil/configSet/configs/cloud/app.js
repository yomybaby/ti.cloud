/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

var testSuites = [
    { name: "cloud" },
	{ name: "cloud_users" },
    { name: "cloud_objects" },
    { name: "cloud_chats" },
    { name: "cloud_socialinteractions" },
    { name: "cloud_places" },
    { name: "cloud_checkins" },
    { name: "cloud_statuses" },
    { name: "cloud_photos" },
    { name: "cloud_pushnotifications" },
    { name: "cloud_keyvalues" },
    { name: "cloud_posts" },
    { name: "cloud_reviews" },
    { name: "cloud_clients" },
    { name: "cloud_emails" },
    { name: "cloud_photocollections" },
    { name: "cloud_acls" },
	{ name: "cloud_friends" },
	{ name: "cloud_messages" },
	{ name: "cloud_events" },
	{ name: "cloud_files" }
] ;
var suites = require('hammer').populateSuites(testSuites);

/*
these lines must be present and should not be modified.  "suites" argument to setSuites is
expected to be an array (should be an empty array at the very least in cases where population of
the suites argument is based on platform type and may result in no valid suites being added to the
argument)
*/
var init = require("init");
init.setSuites(suites);
init.start();