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

    setQuestionInfoLabel();
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
    numberHistoryArea.classList.remove('display-none');
}

function toggleFullscreenMode() {
    if (!isFullscreen()) {
        expandCalculateArea();
        calculateArea.dataset.fullScreen = "1";
    } else {
        contractCalculateArea();
        calculateArea.dataset.fullScreen = "0";
    }
}

function displayHelp() {
    alert(
        '「W」キーを押すとフルスクリーンモードを切り替えます\n' +
        '「Ctrl」キーを押しながら「W」キー（または「Alt」キーを押しながら「F4」キー）を押すと終了します'
    );
}
