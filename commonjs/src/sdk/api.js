function Cocoafish(key, secret, baseURL) {
	if (!secret) {
	    this.appKey = key;
	} else {
	    this.oauthKey = key;
	    this.oauthSecret = secret;
	}
	if (baseURL) {
	    this.apiBaseURL = baseURL;
	} else {
	    this.apiBaseURL = com.cocoafish.sdk.url.baseURL;
	}
	return this;
}

Cocoafish.prototype.sendRequest = function (url, method, data, useSecure, callback) {
	var authType = com.cocoafish.js.sdk.utils.getAuthType(this);
	if (authType == com.cocoafish.constants.unknown) {
	    callback(com.cocoafish.constants.noAppKeyError);
	    return;
	}

	//build request url
	var reqURL = '';
	if (useSecure) {
	    reqURL += com.cocoafish.sdk.url.https;
	} else {
	    reqURL += com.cocoafish.sdk.url.http;
	}
	reqURL += this.apiBaseURL + "/" + com.cocoafish.sdk.url.version + "/" + url;

	if (authType == com.cocoafish.constants.app_key) {
	    reqURL += com.cocoafish.constants.keyParam + this.appKey;
	}

	if (!data)
	    data = {};

	var apiMethod = method ? method.toUpperCase() : com.cocoafish.constants.get_method;

	data[com.cocoafish.constants.suppressCode] = 'true';
	var sessionId = com.cocoafish.js.sdk.utils.retrieveSessionId();
	if (sessionId) {
	    reqURL += formatParam(reqURL, com.cocoafish.constants.sessionId, sessionId);
	}

	injectAnalytics(data, url);
	data = com.cocoafish.js.sdk.utils.cleanInvalidData(data);

	var fileInputObj = com.cocoafish.js.sdk.utils.getFileObject(data);
	if (fileInputObj) {
	    //send request with file
	    try {
	        var binary;
	        if (fileInputObj.toString().match(/TiFilesystemFile/)) {
	            binary = fileInputObj.read();
	        } else {
	            binary = fileInputObj;
	        }

	        if (!binary) {
	            callback(com.cocoafish.constants.fileLoadError);
	            return;
	        }

	        if (data[com.cocoafish.constants.file]) {
	            delete data[com.cocoafish.constants.file];
	            data[com.cocoafish.constants.file] = binary;
	        } else if (data[com.cocoafish.constants.photo]) {
	            delete data[com.cocoafish.constants.photo];
	            data[com.cocoafish.constants.photo] = binary;
	        }
	    } catch (e) {
	        callback(com.cocoafish.constants.fileLoadError);
	        return;
	    }
	    var header = {};
	    if (authType == com.cocoafish.constants.oauth) {
	        reqURL += formatParam(reqURL, com.cocoafish.constants.oauth_consumer_key, this.oauthKey);

	        var message = {
	            method: apiMethod,
	            action: reqURL,
	            parameters: []
	        };
	        com.cocoafish.js.sdk.utils.populateOAuthParameters(message.parameters, this.oauthKey);
	        OAuth.completeRequest(message, {consumerSecret: this.oauthSecret});
	        header['Authorization'] = OAuth.getAuthorizationHeader("", message.parameters);
	    }
	    //send request
	    com.cocoafish.js.sdk.utils.sendAppceleratorRequest(reqURL, apiMethod, data, header, callback);
	} else {
	    //send request without file
	    var header = {};
	    if (authType == com.cocoafish.constants.oauth) {
	        reqURL += formatParam(reqURL, com.cocoafish.constants.oauth_consumer_key, this.oauthKey);

	        var message = {
	            method: apiMethod,
	            action: reqURL,
	            parameters: []
	        };
	        for (var prop in data) {
	            if (!data.hasOwnProperty(prop)) {
	                continue;
	            }
	            message.parameters.push([prop, data[prop]]);
	        }
	        com.cocoafish.js.sdk.utils.populateOAuthParameters(message.parameters, this.oauthKey);
	        OAuth.completeRequest(message, {consumerSecret: this.oauthSecret});
	        header['Authorization'] = OAuth.getAuthorizationHeader("", message.parameters);
	    }
	    com.cocoafish.js.sdk.utils.sendAppceleratorRequest(reqURL, apiMethod, data, header, callback);
	}
};