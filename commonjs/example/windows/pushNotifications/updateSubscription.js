windowFunctions['Update Subscription'] = function (evt) {
    var win = createWindow();
    var offset = addBackButton(win);
    var content = Ti.UI.createScrollView({
        top: offset + u,
        contentHeight: 'auto',
        layout: 'vertical'
    });
    win.add(content);

    if (!pushDeviceToken) {
        content.add(Ti.UI.createLabel({
            text: 'Please visit Push Notifications > Settings to enable push!',
            textAlign: 'center',
            color: '#000',
            height: 'auto'
        }));
        win.open();
        return;
    }

    var channel = Ti.UI.createTextField({
        hintText: 'Channel',
        top: 10 + u, left: 10 + u, right: 10 + u,
        height: 40 + u,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false
    });
    content.add(channel);

    // These variables represent the device's geographic coordinates,
    // and are passed in the 'loc' parameter to the updateSubscription() method.
    // This enables a Dashboard administrator to send a push notification to this user based on their location.

    var latitude = 37.3895100;
    var longitude = -122.0502150;

    var latitude = Ti.UI.createTextField({
        hintText: 'Latitude',
        top: 10 + u, left: 10 + u, right: 10 + u,
        height: 40 + u,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        value: latitude
    });
    content.add(latitude);
    
    var longitude = Ti.UI.createTextField({
        hintText: 'Longitude',
        top: 10 + u, left: 10 + u, right: 10 + u,
        height: 40 + u,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        autocapitalization: Ti.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        value: longitude
    });
    content.add(longitude);

    var button = Ti.UI.createButton({
        title: 'Update',
        top: 10 + u, left: 10 + u, right: 10 + u, bottom: 10 + u,
        height: 40 + u
    });
    content.add(button);    

    var fields = [ channel ];

    function submitForm() {
        for (var i = 0; i < fields.length; i++) {
            if (!fields[i].value.length) {
                fields[i].focus();
                return;
            }
            fields[i].blur();
        }
        button.hide();

        Cloud.PushNotifications.updateSubscription({
            channel: channel.value,
            device_token: pushDeviceToken,
            loc: [parseInt(longitude.value), parseInt(latitude.value)]
        }, function (e) {
            if (e.success) {
                channel.value = '';
                alert('Subscription Updated! ' + pushDeviceToken);
            }
            else {
                error(e);
            }
            button.show();
        });
    }

    button.addEventListener('click', submitForm);
    for (var i = 0; i < fields.length; i++) {
        fields[i].addEventListener('return', submitForm);
    }

    win.addEventListener('open', function () {
        channel.focus();
    });
    win.open();
};