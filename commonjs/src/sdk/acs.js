var ACS = {};
ACS.session = null;

ACS.fetchSetting = function(key, def) {
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

ACS.fetchSession = function() {
	var apiKey = ACS.fetchSetting('acs-api-key', null);
	var baseURL = ACS.fetchSetting('acs-base-url', com.cocoafish.sdk.url.baseURL);
	var authBaseURL = ACS.fetchSetting('acs-authbase-url', com.cocoafish.sdk.url.authBaseURL);
	var consumerKey = ACS.fetchSetting('acs-oauth-key', null);
	var consumerSecret = ACS.fetchSetting('acs-oauth-secret', null);
	if (apiKey) {
	    return new Cocoafish(apiKey, null, baseURL, authBaseURL);
	}
	if (consumerKey && consumerSecret) {
	    return new Cocoafish(consumerKey, consumerSecret, baseURL, authBaseURL);
	}

	throw 'ACS CREDENTIALS NOT SPECIFIED!';
}

ACS.getSession = function() {
	if (ACS.session == null) {
	    ACS.session = ACS.fetchSession();
	}
	return ACS.session;
}

ACS.send = function (url, method, data, useSecure, callback) {
	ACS.getSession().sendRequest(url, method, data, useSecure, callback);
};

ACS.hasStoredSession = function() {
	// Deprecated
	return !!(com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.sessionId));
};

ACS.retrieveStoredSession = function() {
	// Deprecated
	return com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.sessionId);
};

ACS.reset = function () {
	com.cocoafish.js.sdk.utils.deleteCookie(com.cocoafish.constants.sessionId);
	if (ACS.session) {
		ACS.session.clearSession();
		ACS.session = null;
	}
};

ACS.secureSend = function (method, options) {
	var session = ACS.getSession();
	session.useThreeLegged(true);

	if (method === 'secureCreate') {
		session.signUpRequest(options);
	} else if (method === 'secureLogin') {
		session.sendAuthRequest(options);
	}
}

ACS.checkStatus = function () {
	return ACS.getSession().checkStatus();
}
