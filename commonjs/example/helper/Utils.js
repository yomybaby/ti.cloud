// Find out if this is iOS 7 or greater
function isIOS7Plus() {
    if (Titanium.Platform.name == 'iPhone OS') {
        var version = Titanium.Platform.version.split(".");
        var major = parseInt(version[0],10);
        // can only test this support on a 3.2+ device
        if (major >= 7) {
            return true;
        }
    }
    return false;

}

exports.IOS7 = isIOS7Plus();
exports.top = exports.IOS7 ? 20 : 0;
exports.android = Ti.Platform.osname == 'android';
exports.iOS = Ti.Platform.osname == 'ipad' || Ti.Platform.osname == 'iphone';
exports.blackberry = Ti.Platform.osname == 'blackberry';

// Utility functions for defining windows.
var u = Ti.Android != undefined ? 'dp' : 0;
exports.u = u;

exports.createRows = function(rows) {
    for (var i = 0, l = rows.length; i < l; i++) {
        rows[i] = Ti.UI.createTableViewRow({
            backgroundColor: '#fff',
            title: rows[i],
            hasChild: true,
            height: 30 + u,
            font: { fontSize: 20 + u }
        });
    }
    return rows;
}

exports.enumerateProperties = function(container, obj, offset) {
    for (var key in obj) {
        if (!obj.hasOwnProperty(key))
            continue;
        container.add(Ti.UI.createLabel({
            text: key + ': ' + obj[key], textAlign: 'left',
            color: '#000', backgroundColor: '#fff',
            height: 30 + u, left: offset, right: 20 + u
        }));
        if (obj[key].indexOf && obj[key].indexOf('http') >= 0 
            && (obj[key].indexOf('.jpeg') > 0 || obj[key].indexOf('.jpg') > 0 || obj[key].indexOf('.png') > 0)) {
            container.add(Ti.UI.createImageView({
                image: obj[key],
                height: 120 + u, width: 120 + u,
                left: offset
            }));
        }
        if (typeof(obj[key]) == 'object') {
            exports.enumerateProperties(container, obj[key], offset + 20);
        }
    }
}

exports.error = function(e) {
    var msg = (e.error && e.message) || JSON.stringify(e);
    if (e.code) {
        alert(msg);
    } else {
        Ti.API.error(msg);
    }
}

exports.convertISOToDate = function(isoDate) {
    isoDate = isoDate.replace(/\D/g," ");
    var dtcomps = isoDate.split(" ");
    dtcomps[1]--;
    return new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));
}

exports.addBackButton = function(win) {
    if (Ti.Android) {
        return 0;
    }
    var back = Ti.UI.createButton({
        title: 'Back',
        color: '#fff', backgroundColor: '#000',
        style: 0,
        top: top, left: 0, right: 0,
        height: 40 + u
    });
    back.addEventListener('click', function (evt) {
        win.close();
    });
    win.add(back);
    return 40 + top;
}

exports.pushToken = null;
