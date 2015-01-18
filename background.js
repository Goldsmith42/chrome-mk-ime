var Shift = { PLAIN: "plain", SHIFTED: "shifted" };
var contextID = -1;
var shiftState = Shift.PLAIN;
var lastRemappedKeyEvent;

var lut = {
    "Digit1": { "plain": { "plain": "1", "shifted": "!" } },
    "Digit2": { "plain": { "plain": "2", "shifted": "Ñ" } },
    "Digit3": { "plain": { "plain": "3", "shifted": "ì" } },
    "Digit4": { "plain": { "plain": "4", "shifted": "'" } },
    "Digit5": { "plain": { "plain": "5", "shifted": "%" } },
    "Digit6": { "plain": { "plain": "6", "shifted": "Ç" } },
    "Digit7": { "plain": { "plain": "7", "shifted": "ë" } },
    "Digit8": { "plain": { "plain": "8", "shifted": "*" } },
    "Digit9": { "plain": { "plain": "9", "shifted": "(" } },
    "Digit0": { "plain": { "plain": "0", "shifted": ")" } },
    "Minus": { "plain": { "plain": "-", "shifted": "-" } },
    "Equal": { "plain": { "plain": "=", "shifted": "+" } },
    "KeyQ": { "plain": { "plain": "ö", "shifted": "ä" } },
    "KeyW": { "plain": { "plain": "ú", "shifted": "å" } },
    "KeyE": { "plain": { "plain": "Â", "shifted": "≈" } },
    "KeyR": { "plain": { "plain": "", "shifted": "–" } },
    "KeyT": { "plain": { "plain": "Ú", "shifted": "“" } },
    "KeyY": { "plain": { "plain": "æ", "shifted": "Ω" } },
    "KeyU": { "plain": { "plain": "Û", "shifted": "”" } },
    "KeyI": { "plain": { "plain": "Ë", "shifted": "»" } },
    "KeyO": { "plain": { "plain": "Ó", "shifted": "Œ"} },
    "KeyP": { "plain": { "plain": "Ô", "shifted": "œ"} },
    "BracketLeft": { "plain": { "plain": "¯", "shifted": "ÿ" } },
    "BracketRight": { "plain": { "plain": "É", "shifted": "Å" } },
    "KeyA": { "plain": { "plain": "‡", "shifted": "¿" } },
    "KeyS": { "plain": { "plain": "Ò", "shifted": "—" } },
    "KeyD": { "plain": { "plain": "‰", "shifted": "ƒ" } },
    "KeyF": { "plain": { "plain": "Ù", "shifted": "‘" } },
    "KeyG": { "plain": { "plain": "„", "shifted": "√" } },
    "KeyH": { "plain": { "plain": "ı", "shifted": "’" } },
    "KeyJ": { "plain": { "plain": "º", "shifted": "£" } },
    "KeyK": { "plain": { "plain": "Í", "shifted": " " } },
    "KeyL": { "plain": { "plain": "Î", "shifted": "À" } },
    "Semicolon": { "plain": {"plain": "˜", "shifted": "◊" } },
    "Quote": { "plain": { "plain": "ù", "shifted": "ç" } },
    "KeyZ": { "plain": { "plain": "Á", "shifted": "«" } },
    "KeyX": { "plain": { "plain": "ü", "shifted": "è" } },
    "KeyC": { "plain": { "plain": "ˆ", "shifted": "÷" } },
    "KeyV": { "plain": { "plain": "‚", "shifted": "¬" } },
    "KeyB": { "plain": { "plain": "·", "shifted": "¡" } },
    "KeyN": { "plain": { "plain": "Ì", "shifted": "Õ" } },
    "KeyM": { "plain": { "plain": "Ï", "shifted": "Ã" } },
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