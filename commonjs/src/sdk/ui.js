/**
 * Internal UI functions.
 *
 * @static
 * @access private
 */

com.cocoafish.js.sdk.UIManager = {
	redirect_uri: 'acsconnect://success',

	displayModal: function(call) {
		if (Cloud.debug) {
            Ti.API.info('ThreeLegged Request url: ' + call.url);
		}

		var modal = Ti.UI.createWindow({
			modal: true,
			title: call.params.title || "Appcelerator Cloud Service"
		});

		var webView = Ti.UI.createWebView({
			url: call.url,
			scalesPageToFit: false,
			showScrollbars: true
		});

		function checkResponse(e) {
			var re = /^acsconnect:\/\/([^#]*)#(.*)/;
			var result = re.exec(decodeURIComponent(e.url));
			if (result && result.length == 3) {
				var data = null;
				if (result[1] == 'success') {
					data = com.cocoafish.js.sdk.utils.decodeQS(result[2]);
				} else if (result[1] != 'cancel') {
					return;
				}
				// We received either a 'success' or 'cancel' response
				webView.removeEventListener('beforeload', checkResponse);
				webView.removeEventListener('load', checkResponse);

				modal && modal.close();
				call.cb && call.cb(data);
				webView = modal = call = null;
			}
		}

		webView.addEventListener('beforeload', checkResponse);
		webView.addEventListener('load', checkResponse);

		var closeButton = Ti.UI.createButton({
			title: 'close',
			width: '50%',
			height: '20%'
		});
		closeButton.addEventListener('click', function(){
			modal.close();
			call.cb && call.cb();
			webView = modal = call = null;
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
			url    : params.url + com.cocoafish.constants.redirectUriParam + com.cocoafish.js.sdk.UIManager.redirect_uri,
			params : params
		};

		return call;
	}
};

com.cocoafish.js.sdk.UIManager.Actions = {
	login: {
		size: {
			width: 515,
			height: 380
		}
	},
	signup: {
		size: {
			width: 515,
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
