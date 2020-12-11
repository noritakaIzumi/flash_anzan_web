// ボタンイベントなどに使用する関数
function configOffset() {
    const offset = window.prompt("オフセット (ms): 数字が大きいほど音が早く出ます", element[currentMode.innerText].offset.value.toString());
    if (offset) {
        element[currentMode.innerText].offset.value = Number(offset);
    }
}

function loadParams() {
    const loadedParams = localStorage.getItem(savedParamsKeyName);
    if (!loadedParams) {
        window.alert("設定がありません");
        return;
    }
    const response = window.confirm("設定を読み込みますか？");
    if (!response) {
        return;
    }
    const parsedParams = JSON.parse(loadedParams);
    Object.keys(parsedParams).map(
        (mode) => {
            Object.keys(parsedParams[mode]).map(
                (paramName) => {
                    element[mode][paramName].value = parsedParams[mode][paramName];
                });
        }
    );
}

function saveParams() {
    const response = window.confirm("設定を保存しますか？");
    if (!response) {
        return;
    }
    const params = {};
    Object.keys(element).map(
        (mode) => {
            params[mode] = {};
            Object.keys(element[mode]).map(
                (paramName) => {
                    params[mode][paramName] = element[mode][paramName].value;
                });
        }
    );
    localStorage.setItem(savedParamsKeyName, JSON.stringify(params));
    window.alert("設定を保存しました");
}

function deleteParams() {
    const response = window.confirm("設定を削除しますか？");
    if (!response) {
        return;
    }
    localStorage.clear();
    window.alert("設定を削除しました");
}

function setSoundExtension(extension) {
    switch (extension) {
        case 'ogg':
            loadAudioObj(audioAttr.extension.ogg);
            break;
        case 'wav':
            loadAudioObj(audioAttr.extension.wav);
            break;
    }
}

function displayNumberHistoryArea() {
    button.numberHistory.disabled = true;
    numberHistoryArea.style.display = "block";
}
