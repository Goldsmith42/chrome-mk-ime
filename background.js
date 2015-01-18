var Shift = { PLAIN: "plain", SHIFTED: "shifted" };
var contextID = -1;
var shiftState = Shift.PLAIN;
var lastRemappedKeyEvent;

var lut = {
    "Digit1": { "plain": { "plain": "1", "shifted": "!" } },
    "Digit2": { "plain": { "plain": "2", "shifted": "�" } },
    "Digit3": { "plain": { "plain": "3", "shifted": "�" } },
    "Digit4": { "plain": { "plain": "4", "shifted": "'" } },
    "Digit5": { "plain": { "plain": "5", "shifted": "%" } },
    "Digit6": { "plain": { "plain": "6", "shifted": "�" } },
    "Digit7": { "plain": { "plain": "7", "shifted": "�" } },
    "Digit8": { "plain": { "plain": "8", "shifted": "*" } },
    "Digit9": { "plain": { "plain": "9", "shifted": "(" } },
    "Digit0": { "plain": { "plain": "0", "shifted": ")" } },
    "Minus": { "plain": { "plain": "-", "shifted": "-" } },
    "Equal": { "plain": { "plain": "=", "shifted": "+" } },
    "KeyQ": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyW": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyE": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyR": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyT": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyY": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyU": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyI": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyO": { "plain": { "plain": "�", "shifted": "�"} },
    "KeyP": { "plain": { "plain": "�", "shifted": "�"} },
    "BracketLeft": { "plain": { "plain": "�", "shifted": "�" } },
    "BracketRight": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyA": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyS": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyD": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyF": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyG": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyH": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyJ": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyK": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyL": { "plain": { "plain": "�", "shifted": "�" } },
    "Semicolon": { "plain": {"plain": "�", "shifted": "�" } },
    "Quote": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyZ": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyX": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyC": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyV": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyB": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyN": { "plain": { "plain": "�", "shifted": "�" } },
    "KeyM": { "plain": { "plain": "�", "shifted": "�" } },
    "Comma": { "plain": { "plain": ",", "shifted": ";" } },
    "Period": { "plain": { "plain": ".", "shifted": ":" } },
    "Slash": { "plain": { "plain": "/", "shifted": "?" } },
};

chrome.input.ime.onFocus.addListener(function(context) {
    contextID = context.contextID;
});

function updateAltGrState(keyData) {
    altGrState = (keyData.code == "AltRight") ? ((keyData.type == "keydown") ? AltGr.ALTERNATE : AltGr.PLAIN) : altGrState;
}

function updateShiftState(keyData) {
	shiftState = ((keyData.shiftKey && !(keyData.capsLock)) || (!(keyData.shiftKey) && keyData.capsLock)) ? Shift.SHIFTED : Shift.PLAIN;
}

function isPureModifier(keyData) {
	return (keyData.key == "Shift") || (keyData.key == "Ctrl") || (keyData.key == "Alt");
}

function isRemappedEvent(keyData) {
    // hack, should check for a sender ID (to be added to KeyData)
	return lastRemappedKeyEvent &&
          (lastRemappedKeyEvent.key == keyData.key &&
           lastRemappedKeyEvent.code == keyData.code &&
           lastRemappedKeyEvent.type == keyData.type); // requestID would be different so we are not checking for it
}

chrome.input.ime.onKeyEvent.addListener(function(engineID, keyData) {
	var handled = false;
	if (isRemappedEvent(keyData)) {
		lastRemappedKeyEvent = undefined;
		return handled;
	}

	updateShiftState(keyData);
	if (lut[keyData.code]) {
		var remappedKeyData = keyData;
		remappedKeyData.key = lut[keyData.code][shiftState];
		remappedKeyData.code = keyData.code;
		if (chrome.input.ime.sendKeyEvents) {
			chrome.input.ime.sendKeyEvents({ "contextID": contextID, "keyData": [remappedKeyData] });
			handled = true;
			lastRemappedKeyEvent = remappedKeyData;
		} else if (keyData.type == "keydown" && !isPureModifier(keyData)) {
			chrome.input.ime.commitText({ "contextID": contextID, "text": remappedKeyData.key });
			handled = true;
		}
    }
	return handled;
});