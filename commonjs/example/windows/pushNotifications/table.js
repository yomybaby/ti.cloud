var WindowManager = require('helper/WindowManager');
var Utils = require('helper/Utils');
var Cloud = require('ti.cloud');
WindowManager.include(

    '/windows/pushNotifications/query',
    '/windows/pushNotifications/notify',
    '/windows/pushNotifications/settings',
    '/windows/pushNotifications/subscribe',
    '/windows/pushNotifications/unsubscribe',
    '/windows/pushNotifications/notifyTokens',
    '/windows/pushNotifications/subscribeToken',
    '/windows/pushNotifications/unsubscribeToken',
    '/windows/pushNotifications/updateSubscription',
    '/windows/pushNotifications/showChannels',
    '/windows/pushNotifications/queryChannels',
    '/windows/pushNotifications/setBadge',
    '/windows/pushNotifications/resetBadge'
);
exports['Push Notifications'] = function () {
    var win = WindowManager.createWindow({
        backgroundColor: 'white'
    });

    var rows = [
        'Notify',
        'Notify Tokens',
        'Query Subscriptions',
        'Show Channels',
        'Query Channels',
        'Set Badge',
        'Reset Badge'
    ];
    if (Ti.Platform.name === 'iPhone OS' || Ti.Platform.name === 'android') {
        rows.push('Settings for This Device');
        rows.push('Subscribe');
        rows.push('Unsubscribe');
        rows.push('Subscribe Token');
        rows.push('Unsubscribe Token');
        rows.push('Update Subscription');
    }
    else {
        // Our other platforms do not support push notifications yet.
    }

    var table = Ti.UI.createTableView({
        backgroundColor: '#fff',
        top: 0,
        data: Utils.createRows(rows)
    });
    table.addEventListener('click', WindowManager.handleOpenWindow);
    win.add(table);
    return win;
};

function receivePush(e) {
    alert('Received push: ' + JSON.stringify(e));
}

var androidPushModule = null;
function enablePushNotifications() {
    Utils.pushNotificationsEnabled = true;
    Ti.App.Properties.setBool('PushNotifications-Enabled', true);
    checkPushNotifications();
}

function disablePushNotifications() {
    Utils.pushNotificationsEnabled = false;
    Ti.App.Properties.setBool('PushNotifications-Enabled', false);
    checkPushNotifications();
}

function getAndroidPushModule() {
    try {
        return require('ti.cloudpush')
    }
    catch (err) {
        alert('Unable to require the ti.cloudpush module for Android!');
        Utils.pushNotificationsEnabled = false;
        Ti.App.Properties.setBool('PushNotifications-Enabled', false);
        return null;
    }
}

function checkPushNotifications() {
    if (Utils.pushNotificationsEnabled === null) {
        Utils.pushNotificationsEnabled = Ti.App.Properties.getBool('PushNotifications-Enabled', false);
    }
    if (Ti.Platform.name === 'iPhone OS') {
        if (Utils.pushNotificationsEnabled) {
            if (Titanium.Platform.model == 'Simulator') {
                alert('The simulator does not support push!');
                disablePushNotifications();
                return;
            }
            Ti.Network.registerForPushNotifications({
                types: [
                    Ti.Network.NOTIFICATION_TYPE_BADGE,
                    Ti.Network.NOTIFICATION_TYPE_ALERT,
                    Ti.Network.NOTIFICATION_TYPE_SOUND
                ],
                success: deviceTokenSuccess,
                error: deviceTokenError,
                callback: receivePush
            });
        }
        else {
            Ti.Network.unregisterForPushNotifications();
            Utils.pushDeviceToken = null;
        }
    }
    else if (Ti.Platform.name === 'android') {
        if (androidPushModule === null) {
            androidPushModule = getAndroidPushModule();
            if (androidPushModule === null) {
                return;
            }
        }
        if (Utils.pushNotificationsEnabled) {
            // Need to retrieve the device token before enabling push
            androidPushModule.retrieveDeviceToken({
                success: deviceTokenSuccess,
                error: deviceTokenError
            });
        }
        else {
            androidPushModule.enabled = false;
            androidPushModule.removeEventListener('callback', receivePush);
            Utils.pushDeviceToken = null;
        }
    }
}

function deviceTokenSuccess(e) {
    Utils.pushDeviceToken = e.deviceToken;
    Utils.pushToken = Utils.pushDeviceToken; 
    alert('Device token is retrieved: ' + Utils.pushDeviceToken);
    Ti.API.info('Device Token: ' + Utils.pushDeviceToken);
    if (androidPushModule) {
        androidPushModule.enabled = true;
        androidPushModule.addEventListener('callback', receivePush);
    }
}

function deviceTokenError(e) {
    alert('Failed to register for push! ' + e.error);
    disablePushNotifications();
}

checkPushNotifications();