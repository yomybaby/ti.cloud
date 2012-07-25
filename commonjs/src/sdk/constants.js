//REST APIs

//Protocols
com.cocoafish.sdk.url.http = 'http://';
com.cocoafish.sdk.url.https = 'https://';

//URL
com.cocoafish.sdk.url.baseURL = 'api.cloud.appcelerator.com';
com.cocoafish.sdk.url.version = 'v1';

//Authentication Types
com.cocoafish.constants.app_key = 1;
com.cocoafish.constants.oauth = 2;
com.cocoafish.constants.unknown = -1;

//Others
com.cocoafish.constants.keyParam = '?key=';
com.cocoafish.constants.file = 'file';
com.cocoafish.constants.photo = 'photo';
com.cocoafish.constants.suppressCode = 'suppress_response_codes';
com.cocoafish.constants.sessionId = '_session_id';
com.cocoafish.constants.oauth_consumer_key = 'oauth_consumer_key';
com.cocoafish.constants.noAppKeyError = {'meta': {'status': 'fail', 'code': 409, 'message': 'Application key is not provided.'}};
com.cocoafish.constants.fileLoadError = {'meta': {'status': 'fail', 'code': 400, 'message': 'Unable to load file'}};
