function injectAnalytics(data, url) {
    if (Ti.App.analytics) {
        var obj = data.analytics || {};
        obj.id = Ti.Platform.createUUID();
        if (Ti.Platform.id) {
            obj.mid = Ti.Platform.id;
        }
        obj.aguid = Ti.App.guid;
        obj.event = 'cloud.' + url.replace(/\//g, '.').replace(/\.json/, '');
        obj.deploytype = Ti.App.deployType || 'development';
        obj.sid = Ti.App.sessionId;
        data['ti_analytics'] = JSON.stringify(obj);
    }
}
