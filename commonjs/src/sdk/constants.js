//REST APIs

//Protocols
com.cocoafish.sdk.url.http = 'http://';
com.cocoafish.sdk.url.https = 'https://';

//URL
com.cocoafish.sdk.url.baseURL = 'api.cloud.appcelerator.com';
com.cocoafish.sdk.url.authBaseURL = 'secure-identity.cloud.appcelerator.com';
com.cocoafish.sdk.url.version = 'v1';

//Authentication Types
com.cocoafish.constants.app_key = 1;
com.cocoafish.constants.oauth = 2;
com.cocoafish.constants.three_legged_oauth = 3;
com.cocoafish.constants.unknown = -1;

//Others
com.cocoafish.constants.keyParam = '?key=';
com.cocoafish.constants.oauthKeyParam = '?oauth_consumer_key=';
com.cocoafish.constants.clientIdParam = '?client_id=';
com.cocoafish.constants.redirectUriParam = '&redirect_uri=';
com.cocoafish.constants.responseTypeParam = '&response_type=';
com.cocoafish.constants.accessToken = 'access_token';
com.cocoafish.constants.expiresIn = 'expires_in';
com.cocoafish.constants.appKey = 'app_key';
com.cocoafish.constants.json='json';
com.cocoafish.constants.sessionId = '_session_id';
com.cocoafish.constants.sessionCookieName = 'Cookie';
com.cocoafish.constants.responseCookieName = 'Set-Cookie';
com.cocoafish.constants.ie = 'MSIE';
com.cocoafish.constants.ie_v7 = 7;
com.cocoafish.constants.file = 'file';
com.cocoafish.constants.photo = 'photo';
com.cocoafish.constants.suppressCode = 'suppress_response_codes';
com.cocoafish.constants.response_wrapper = 'response_wrapper';
com.cocoafish.constants.oauth_consumer_key = 'oauth_consumer_key';
com.cocoafish.constants.photo = 'photo';
com.cocoafish.constants.method = '_method';
com.cocoafish.constants.name = 'name';
com.cocoafish.constants.value = 'value';
com.cocoafish.constants.oauth_header = 'Authorization';
com.cocoafish.constants.noAppKeyError = {'meta': {'status': 'fail', 'code': 409, 'message': 'Application key is not provided.'}};
com.cocoafish.constants.fileLoadError = {'meta': {'status': 'fail', 'code': 400, 'message': 'Unable to load file'}};
