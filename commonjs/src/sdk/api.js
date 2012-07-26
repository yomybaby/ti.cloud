//if you want to use three-legged OAuth, always pass OAuth key to the key argument
function Cocoafish(key, secret, baseURL, authBaseURL) {

	//a flag indicating whether 3-legged oauth will be used
	var threeLegged = false;

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
	if (authBaseURL) {
		this.authBaseURL = authBaseURL;
	} else {
		this.authBaseURL = com.cocoafish.sdk.url.authBaseURL;
	}

	this.useThreeLegged = function(isThreeLegged) {
		threeLegged = isThreeLegged;
		if(!this.oauthKey) //If three-legged OAuth is used the passed in 'key' should be OAuth key
			this.oauthKey = this.appKey;
	};

	this.isThreeLegged = function() {
		return threeLegged;
	};

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
	} else {
		//For both 2-legged and 3-legged oauth there should be an OAuth key
        reqURL += com.cocoafish.constants.oauthKeyParam + this.oauthKey;
	}

	if (!data)
	    data = {};

	var apiMethod = method ? method.toUpperCase() : 'GET';

	data[com.cocoafish.constants.suppressCode] = 'true';
	if(!this.isThreeLegged()) {
		var sessionId = com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.sessionId);
		if (!sessionId)
			sessionId = this.session_id;

		if (sessionId) {
		    reqURL += formatParam(reqURL, com.cocoafish.constants.sessionId, sessionId);
		}
	}

    if(this.isThreeLegged()) {
        if(!this.accessToken) {
            var session = this.getSession();
            if(session) {
                this.accessToken = session.access_token;;
            }
        }

        //alert('sendRequest -> url: ' + url + ' access token: ' + this.accessToken);
        if(this.accessToken) {
            data[com.cocoafish.constants.accessToken] = this.accessToken;
        }
    }

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
	    if ((authType == com.cocoafish.constants.oauth) || (authType == com.cocoafish.constants.three_legged_oauth)) {
	        //BUGBUG -- NOT NEEDED? reqURL += formatParam(reqURL, com.cocoafish.constants.oauth_consumer_key, this.oauthKey);

	        var message = {
	            method: apiMethod,
	            action: reqURL,
	            parameters: []
	        };
	        com.cocoafish.js.sdk.utils.populateOAuthParameters(message.parameters, this.oauthKey);
		    if(this.oauthSecret) {
	            OAuth.completeRequest(message, {consumerSecret: this.oauthSecret});
		    }
	        header['Authorization'] = OAuth.getAuthorizationHeader("", message.parameters);
	    }
	    //send request
	    com.cocoafish.js.sdk.utils.sendAppceleratorRequest(reqURL, apiMethod, data, header, callback, this);
	} else {
	    //send request without file
	    var header = {};
		if ((authType == com.cocoafish.constants.oauth) || (authType == com.cocoafish.constants.three_legged_oauth)) {
	        //BUGBUG -- NOT NEEDED? reqURL += formatParam(reqURL, com.cocoafish.constants.oauth_consumer_key, this.oauthKey);

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
			if(this.oauthSecret) {
	            OAuth.completeRequest(message, {consumerSecret: this.oauthSecret});
			}
	        header['Authorization'] = OAuth.getAuthorizationHeader("", message.parameters);
	    }
	    com.cocoafish.js.sdk.utils.sendAppceleratorRequest(reqURL, apiMethod, data, header, callback, this);
	}
};

//authorization request needs to be sent explicitly
//options expected: redirectUri, useSecure, params
//params option is an object containing arguments for popup window or iframe
Cocoafish.prototype.sendAuthRequest = function(options) {

  //send a request to authorization server
  //authorization server will redirect browser for login
  //if logged in authorizations server will redirect browser back to original auth url
  //after authorized authorization server will redirect browser back to redirectUri
  //app can then send API request using access token obtained from authorization server
  var authType = com.cocoafish.js.sdk.utils.getAuthType(this);
  if(authType !== com.cocoafish.constants.three_legged_oauth) {
      alert('wrong authorization type!');
      return;
  }

  options = options || {};

  var isSecure = false;
  if(typeof(options.useSecure) == 'boolean') {
      isSecure = options.useSecure;
  }

  //build request url
  var reqURL = '';
  if(isSecure) {
      reqURL += com.cocoafish.sdk.url.https;
  } else {
      reqURL += com.cocoafish.sdk.url.http;
  }
  reqURL += this.authBaseURL;
  reqURL += '/oauth/authorize';
  reqURL += com.cocoafish.constants.clientIdParam + this.oauthKey;
  reqURL += com.cocoafish.constants.responseTypeParam + 'token';

	var params = options.params || {};
	params.action = 'login';
	params.url = reqURL;

	var that = this;
	var cb = params.cb;
	if(cb) delete params.cb;
	com.cocoafish.js.sdk.ui(params, function(data) {
		that.saveSession(data);
		cb && cb(data);
	});
};


//signing up request needs to be sent explicitly
//options expected: redirectUri, useSecure, params
//params option is an object containing arguments for popup window or iframe
Cocoafish.prototype.signUpRequest = function(options) {

  //send a request to authorization server
  //authorization server will redirect browser for signup
  //if signed up successfully authorizations server will redirect browser back to auth url
  //after authorized authorization server will redirect browser back to redirectUri
  //app can then send API request using access token obtained from authorization server
  var authType = com.cocoafish.js.sdk.utils.getAuthType(this);
  if(authType !== com.cocoafish.constants.three_legged_oauth) {
      alert('wrong authorization type!');
      return;
  }

  options = options || {};

  var isSecure = false;
  if(typeof(options.useSecure) == 'boolean') {
      isSecure = options.useSecure;
  }

  //build request url
  var reqURL = '';
  if(isSecure) {
      reqURL += com.cocoafish.sdk.url.https;
  } else {
      reqURL += com.cocoafish.sdk.url.http;
  }
  reqURL += this.authBaseURL;
  reqURL += '/users/sign_up';
  reqURL += com.cocoafish.constants.clientIdParam + this.oauthKey;

	var params = options.params || {};
	params.action = 'signup';
	params.url = reqURL;

	var that = this;
	var cb = params.cb;
	if(cb) delete params.cb;
	com.cocoafish.js.sdk.ui(params, function(data) {
		that.saveSession(data);
		cb && cb(data);
	});
};

//Invalidating request needs to be sent explicitly
//options expected: redirectUri, useSecure, params
//params option is an object containing arguments for popup window or iframe
Cocoafish.prototype.invalidateTokenRequest = function(options) {

  //send a request to invalidate the current access token
  //authorization server will redirect to rediretUri or return back javascript code to post
  //message to main window depending on the mode (CURRENT/POPUP).
  //client should redirect user back to the home page and show current status accordingly.

  var authType = com.cocoafish.js.sdk.utils.getAuthType(this);
  if(authType !== com.cocoafish.constants.three_legged_oauth) {
      alert('wrong authorization type!');
      return;
  }

  options = options || {};

  var isSecure = false;
  if(typeof(options.useSecure) == 'boolean') {
      isSecure = options.useSecure;
  }

  //build request url
  var reqURL = '';
  if(isSecure) {
      reqURL += com.cocoafish.sdk.url.https;
  } else {
      reqURL += com.cocoafish.sdk.url.http;
  }
  reqURL += this.authBaseURL;
  reqURL += '/oauth/invalidate?';
  reqURL += com.cocoafish.constants.accessToken + '=' + this.accessToken;

    this.clearSession();

	var params = options.params || {};
	params.action = 'logout';
	params.url = reqURL;

	var cb = params.cb;
	if(cb) delete params.cb;
	com.cocoafish.js.sdk.ui(params, function(data) {
		cb && cb(data);
	});
};

//Default implementation to store session in cookies.
//Developers can override this for custom implementation.
//data object should contain the following properties. The properties will also be added to the SDK object.
//	access_token
//	expires_in
Cocoafish.prototype.saveSession = function(data) {
    //TODO check validity of the access token
    if(!data || !data.access_token) {
        this.authorized = false;
        return false;
    }
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.accessToken, data.access_token);
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.expiresIn, data.expires_in);
    this.accessToken = data.access_token;
    this.expiresIn = data.expires_in;

    //alert('Cocoafish saveSession called with: ' + data.access_token + ' ' + data.expires_in);
    this.authorized = true;
    return true;
};

//Default implementation to restore session from cookie
//Developers can override this for custom implementation.
//will return an data object containing the following properties. The properties will also be added to the SDK object.
//	access_token
//	expires_in
Cocoafish.prototype.getSession = function() {
    var data = {};
    data.access_token = com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.accessToken);
    data.expires_in = com.cocoafish.js.sdk.utils.getCookie(com.cocoafish.constants.expiresIn);
    //TODO check validity of the access token
    if(!data.access_token) {
        this.authorized = false;
        return false;
    }

    this.accessToken = data.access_token;
    this.expiresIn = data.expires_in;

    this.authorized = true;
    //alert('Cocoafish getSession called to get: ' + data.access_token + ' ' + data.expires_in);
    return data;
};

//Default implementation to clear session from cookie.
//Developers can override this for custom implementation.
Cocoafish.prototype.clearSession = function() {
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.accessToken, '');
    com.cocoafish.js.sdk.utils.setCookie(com.cocoafish.constants.expiresIn, '');
    delete this.accessToken;
    delete this.expiresIn;
    this.authorized = false;
    //alert('Cocoafish clearSession called');
};



//check the current session status: logged-in? just-authenticated? need-to-login?
Cocoafish.prototype.checkStatus = function() {
    if(this.getSession()) {
    	return true;
    } else {
     	return false;
    }
};


