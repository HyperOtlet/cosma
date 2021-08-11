const {
        app, // app event lifecycle, events
        BrowserWindow, // app windows generator
        ipcMain // interface of data exchange
    } = require('electron')
    , path = require('path');

const Config = require('../models/config')
    , state = require('../models/state');

module.exports = function () {

    if (state.openedWindows.config === true) { return; }

    /**
     * Window
     * ---
     * manage displaying
     */

    let window, newRecordModal;

    window = new BrowserWindow ({
        width: 800,
        height: 500,
        show: false,
        icon: path.join(__dirname, '../../assets/icons/64x64.png'),
        webPreferences: {
            devTools: true,
            allowRunningInsecureContent: false,
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            sandbox: true,
            preload: path.join(__dirname, '../controller.js')
        },
        title: 'Configuration'
    })
    
    window.loadFile(path.join(__dirname, './config-source.html'));

    window.once('ready-to-show', () => {
        window.show();
        state.openedWindows.config = true;
        // window.webContents.openDevTools();
    });

    window.once('closed', () => {
        state.openedWindows.config = false;
    });

    /**
     * API
     * ---
     * manage data
     */

    ipcMain.on("sendConfigOptions", (event, data) => {
        const config = new Config(data);
    
        let result = config.save()
            , response;
    
        if (result === true) {
            response = {
                isOk: true,
                consolMsg: "La configuration a bien été enregistrée. Veuillez relancer l'application.",
                data: {}
            };
        } else if (result === false) {
            response = {
                isOk: false,
                consolMsg: "La configuration n'a pas pu être enregistrée.",
                data: {}
            };
        } else {
            response = {
                isOk: false,
                consolMsg: "La configuration saisie est invalide. Veuillez apporter les corrections suivantes : " + result.join(' '),
                data: {}
            };
        }

        window.webContents.send("confirmConfigRegistration", response);
    });

    ipcMain.on("askConfig", (event, data) => {
        const config = new Config(data);

        let result = config.get();
    
        if (result === true) {
            response = {
                isOk: true,
                consolMsg: "La configuration a bien été transmise.",
                data: config.opts
            };
        } else {
            response = {
                isOk: false,
                consolMsg: "La configuration n'a pu être transmise.",
                data: {}
            };
        }

        window.webContents.send("getConfig", response);
    });

    ipcMain.on("askNewRecordTypeModal", (event, data) => {
        newRecordModal = new BrowserWindow ({
            width: 300,
            height: 400,
            minimizable: false, maximizable: false, fullscreenable: false,
            skipTaskbar: true,
            autoHideMenuBar: true,
            frame: true,
            show: false,
            parent: window,
            modal: true,
            icon: path.join(__dirname, '../../assets/icons/64x64.png'),
            webPreferences: {
                allowRunningInsecureContent: false,
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false,
                sandbox: true,
                preload: path.join(__dirname, '../controller.js')
            },
            title: 'Configuration'
        })

        newRecordModal.loadFile(path.join(__dirname, './config-modal-add-source.html'));

        newRecordModal.once('ready-to-show', () => {
            newRecordModal.show();
        });
    });

    ipcMain.on("sendNewRecordTypeToConfig", (event, data) => {
        let config = new Config();
        let recordTypes = config.opts.record_types;

        recordTypes[data.name] = data.color;

        config = new Config({
            record_types: recordTypes
        });

        let result = config.save()
            , response;
    
        if (result === true) {
            response = {
                isOk: true,
                consolMsg: "Le nouveau type de fiche a bien été enregistré dans la configuration.",
                data: data
            };

            window.webContents.send("confirmNewRecordTypeFromConfig", response);
            newRecordModal.close();
        } else if (result === false) {
            response = {
                isOk: false,
                consolMsg: "Le nouveau type de fiche n'a pas pu être enregistrée dans la configuration.",
                data: data
            };

            newRecordModal.webContents.send("confirmNewRecordTypeFromConfig", response);
        } else {
            response = {
                isOk: false,
                consolMsg: "La configuration saisie est invalide. Veuillez apporter les corrections suivantes : " + result.join(' '),
                data: data
            };

            newRecordModal.webContents.send("confirmNewRecordTypeFromConfig", response);
        }
    });

}