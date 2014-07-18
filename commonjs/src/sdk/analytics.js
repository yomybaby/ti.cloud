function injectAnalytics(data, url) {
    var obj = data.analytics || {};
    if (Ti.Platform.id) {
        obj.mid = Ti.Platform.id;
    }
    obj.app_version = Ti.App.version;
    obj.platform = Ti.Platform.name;
    if (obj.platform === 'iPhone OS') {
        obj.platform = 'ios';
    } 
    if (Ti.App.analytics) {
        obj.sid = Ti.App.sessionId;
    }
    data['ti_analytics'] = JSON.stringify(obj);
}
