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
	var baseURL = fetchSetting('acs-base-url', com.cocoafish.sdk.url.baseURL);
	var authBaseURL = fetchSetting('acs-authbase-url', com.cocoafish.sdk.url.authBaseURL);
	var consumerKey = fetchSetting('acs-oauth-key', null);
	var consumerSecret = fetchSetting('acs-oauth-secret', null);
	if (consumerKey && consumerSecret) {
	    return new Cocoafish(consumerKey, consumerSecret, baseURL, authBaseURL);
	}
	if (apiKey) {
	    return new Cocoafish(apiKey, null, baseURL, authBaseURL);
	}

	throw 'ACS CREDENTIALS NOT SPECIFIED!';
}

function getSession() {
	if (session == null) {
	    session = fetchSession();
	}
	return session;
}
var session = null;
ACS.send = function (url, method, data, useSecure, callback) {
	getSession().sendRequest(url, method, data, useSecure, callback);
};

ACS.hasStoredSession = function() {
	return !!(com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.sessionId));
};

ACS.retrieveStoredSession = function() {
	return com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.sessionId);
};

ACS.reset = function () {
	com.cocoafish.js.sdk.utils.deleteCookie(com.cocoafish.constants.sessionId);
	if (session) {
		session.clearSession();
		session = null;
	}
};

ACS.secureSend = function (method, options) {
	var session = getSession();
	session.useThreeLegged(true);

	if (method === 'secureCreate') {
		session.signUpRequest(options);
	} else if (method === 'secureLogin') {
		session.sendAuthRequest(options);
	}
}

ACS.checkStatus = function () {
	return getSession().checkStatus();
}
