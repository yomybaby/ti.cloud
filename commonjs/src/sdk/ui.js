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

		var nav = null;
		var modal = Ti.UI.createWindow({
			fullscreen: false,
			title: call.params.title || "Appcelerator Cloud Service"
		});

		var webView = Ti.UI.createWebView({
			url: call.url,
			scalesPageToFit: false,
			showScrollbars: true
		});

		var loading = Ti.UI.createLabel({
			text: 'Loading, please wait...',
			color: 'black',
			width: Ti.UI.SIZE || 'auto',
			height: Ti.UI.SIZE || 'auto',
			zIndex: 100
		});

		var response;

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

				response = data;
				if(nav != null) {
					nav.close();
				} else {
					modal && modal.close();
				}
			}

			if (loading && (e.type == 'load')) {
				modal.remove(loading);
				loading = null;
			}
		}

		webView.addEventListener('beforeload', checkResponse);
		webView.addEventListener('load', checkResponse);
		modal.addEventListener('close', closeHandler);
		if (Ti.Platform.osname != 'android') {
			var closeButton = Ti.UI.createButton({
				title: 'close',
				width: '50%',
				height: '20%'
			});
			closeButton.addEventListener('click', function(){
				nav.close();
			});
			modal.rightNavButton = closeButton;
			if(Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ios') {
				nav = Ti.UI.iOS.createNavigationWindow({
					window: modal
				});
			}
		}

		function closeHandler(e) {
			if (call) {
				call.cb && call.cb(response);
				webView = modal = loading = call = response = null;
			}
		};

		modal.add(webView);
		modal.add(loading);
		if(nav != null) {
			nav.open({modal: true});
		} else {
			modal.open();
		}
		
	},

	processParams: function(params, cb) {
		// the basic call data
		var call = {
			cb     : cb,
			url    : params.url + com.cocoafish.constants.redirectUriParam + com.cocoafish.js.sdk.UIManager.redirect_uri,
			params : params
		};

		return call;
	}
};

/**
 * Method for triggering UI interaction with Authorization Server.
 */
com.cocoafish.js.sdk.ui = function(params, cb) {
	if (Ti.Platform.osname === "mobileweb") {
		// We are not supporting MobileWeb at this time.
		alert("Three Legged OAuth is not currently supported on MobileWeb");
		return;
	}
	if (!params.action) {
        alert('"action" is a required parameter for com.cocoafish.js.sdk.ui().');
        return;
    }
    var call = com.cocoafish.js.sdk.UIManager.processParams(params, cb);
    if (call) {
	    com.cocoafish.js.sdk.UIManager.displayModal(call);
    }
};
