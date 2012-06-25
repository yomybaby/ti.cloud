/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

var harnessGlobal = new Object();

harnessGlobal.common = require("common");
harnessGlobal.common.init(harnessGlobal);

harnessGlobal.util = require("util");
harnessGlobal.util.init(harnessGlobal);

harnessGlobal.suites = [
    {name: "modules/cloud/cloud"},
	{name: "modules/cloud/cloud_users"},
    {name: "modules/cloud/cloud_objects"},
    {name: "modules/cloud/cloud_chats"},
    {name: "modules/cloud/cloud_socialinteractions"},
    {name: "modules/cloud/cloud_places"},
    {name: "modules/cloud/cloud_checkins"},
    {name: "modules/cloud/cloud_statuses"},
    {name: "modules/cloud/cloud_photos"},
    {name: "modules/cloud/cloud_pushnotifications"},
    {name: "modules/cloud/cloud_keyvalues"},
    {name: "modules/cloud/cloud_posts"},
    {name: "modules/cloud/cloud_reviews"},
    {name: "modules/cloud/cloud_clients"},
    {name: "modules/cloud/cloud_emails"},
    {name: "modules/cloud/cloud_photocollections"},
    {name: "modules/cloud/cloud_acls"}
];

harnessGlobal.socketPort = 40404;
harnessGlobal.common.connectToDriver();
