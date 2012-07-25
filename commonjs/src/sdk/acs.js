function fetchSetting(key, def) {
    var value;
    var deployType = Ti.App.deployType.toLowerCase() == 'production' ? 'production' : 'development';
    if ((value = Ti.App.Properties.getString(key + '-' + deployType)) && value != 'undefined') {
        return value;
    }
    if ((value = Ti.App.Properties.getString(key)) && value != 'undefined') {
        return value;
    }
    return def;
}

function fetchSession() {
	var apiKey = fetchSetting('acs-api-key', null);
	var baseURL = fetchSetting('acs-base-url', 'api.cloud.appcelerator.com');
	var consumerKey = fetchSetting('acs-oauth-key', null);
	var consumerSecret = fetchSetting('acs-oauth-secret', null);
	if (consumerKey && consumerSecret) {
	    return new Cocoafish(consumerKey, consumerSecret, baseURL);
	}
	if (apiKey) {
	    return new Cocoafish(apiKey, null, baseURL);
	}

	throw 'ACS CREDENTIALS NOT SPECIFIED!';
}

var session = null;
ACS.send = function (url, method, data, useSecure, callback) {
	if (session == null) {
	    session = fetchSession();
	}
	session.sendRequest(url, method, data, useSecure, callback);
};

ACS.hasStoredSession = function() {
	return !!(com.cocoafish.js.sdk.utils.retrieveSessionId());
};

ACS.retrieveStoredSession = function() {
	return com.cocoafish.js.sdk.utils.retrieveSessionId();
};

ACS.reset = function () {
	com.cocoafish.js.sdk.utils.clearSessionId();
	session = null;
};