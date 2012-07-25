/*
var win  = Ti.UI.createWindow({
	backgroundColor: 'white'
});
win.open();

var openButton = Ti.UI.createButton({
	title: 'open',
	width: '50%',
	height: '20%'
});
openButton.addEventListener('click', function(){
	var newWin = createModalWin("http://www.google.com");
	newWin.open();
});

win.add(openButton);

function createModalWin(url){
	var modal = Ti.UI.createWindow({
		modal: true
	});
	var webView = Ti.UI.createWebView({
		url: url
	});
	var closeButton = Ti.UI.createButton({
		title: 'close',
		width: '50%',
		height: '20%'
	});
	closeButton.addEventListener('click', function(){
		modal.close();
	});

	modal.add(webView);
	modal.rightNavButton = closeButton;

	return modal;
}
*/