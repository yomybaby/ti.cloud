var redirectUrl = 'about:blank';

com.cocoafish.js.sdk.UIManager = {
	getData: function(uri) {
		var s = decodeURIComponent(uri).split(redirectUrl + "#");
		if (s.length > 1) {
			return com.cocoafish.js.sdk.utils.decodeQS(s[1]);
		}
		return null;
	},

	displayModal: function(call) {
		var modal = Ti.UI.createWindow({
			modal: true
			//BUGBUG: DOES THIS MESS UP IOS AND ANDROID AND IPAD???
			//,
			// width: call.size.width,
			// height: call.size.height
		});
		if (Cloud.debug) {
            Ti.API.info('ThreeLegged Request url: ' + call.url);
		}
		var webView = Ti.UI.createWebView({
			url: call.url,
			scalesPageToFit: false,
			showScrollbars: true
		});
		webView.addEventListener('load', function(e){
			if (Cloud.debug) {
				Ti.API.info('ThreeLegged Response: ' + JSON.stringify(e));
			}
			var data = com.cocoafish.js.sdk.UIManager.getData(e.url);
			if (data != null) {
				modal.close();
				call.cb && call.cb(data);
			}
		});
		webView.addEventListener('error', function(e){
			if (Cloud.debug) {
				Ti.API.info('ThreeLegged Response: ' + JSON.stringify(e));
			}
			var data = com.cocoafish.js.sdk.UIManager.getData(e.url);
			if (data != null) {
				modal.close();
				call.cb && call.cb(data);
			}
		});
		var closeButton = Ti.UI.createButton({
			title: 'close',
			width: '50%',
			height: '20%'
		});
		closeButton.addEventListener('click', function(){
			modal.close();
		});

		modal.add(webView);
		modal.rightNavButton = closeButton;

		modal.open();
	},

	processParams: function(params, cb) {
		var action = com.cocoafish.js.sdk.UIManager.Actions[params.action.toLowerCase()];

		com.cocoafish.js.sdk.utils.copy(params, action, false);

		// the basic call data
		var call = {
			cb     : cb,
			size   : params.size || {},
			url    : params.url + com.cocoafish.constants.redirectUriParam + redirectUrl,
			params : params
		};

		return call;
	}
};

com.cocoafish.js.sdk.UIManager.Actions = {
	login: {
		display:'popup',
		size: {
			width: 500,
			height: 350
		}
	},
	logout: {
		display:'hidden',
		size: {
			width: 0,
			height: 0
		}
	},
	signup: {
		display:'popup',
		size: {
			width: 500,
			height: 650
		}
	}
};

/**
 * Method for triggering UI interaction with Authorization Server.
 */
com.cocoafish.js.sdk.ui = function(params, cb) {
	if (!params.action) {
        alert('"action" is a required parameter for com.cocoafish.js.sdk.ui().');
        return;
    }
    var call = com.cocoafish.js.sdk.UIManager.processParams(params, cb);
    if (call) {
	    com.cocoafish.js.sdk.UIManager.displayModal(call);
    }
};
