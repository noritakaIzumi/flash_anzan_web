function loadParams() {
    const modal = document.getElementById('loadParamsCompletedModal');
    const modalMessage = modal.querySelector('.modal-body > p')

    const loadedParams = localStorage.getItem(savedParamsKeyName);
    if (!loadedParams) {
        modalMessage.innerHTML = '設定がありません';
        return;
    }
    modalMessage.innerHTML = '設定を読み込みました';

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
}

function deleteParams() {
    localStorage.clear();
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

function toggleFullscreenMode() {
    if (!isFullscreen()) {
        expandCalculateArea();
        calculateArea.dataset.fullScreen = "1";
    } else {
        contractCalculateArea();
        calculateArea.dataset.fullScreen = "0";
    }
}

function toggleMute() {
    if (isMuted.checked) {
        muteStatus.innerHTML = '<i class="bi bi-volume-mute"></i><span class="ps-2">Audio Off</span>';
    } else {
        muteStatus.innerHTML = '<i class="bi bi-volume-up"></i><span class="ps-2">Audio On</span>';
    }
}
