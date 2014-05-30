function injectAnalytics(data, url) {
    if (Ti.App.analytics) {
        var obj = data.analytics || {};
        if (Ti.Platform.id) {
            obj.mid = Ti.Platform.id;
        }
        obj.sid = Ti.App.sessionId;
        obj.app_version = Ti.App.version;
        obj.platform = Ti.Platform.name;
        if (obj.platform === 'iPhone OS') {
            obj.platform = 'ios';
        } 
        data['ti_analytics'] = JSON.stringify(obj);
    }
}
