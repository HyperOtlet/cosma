/**
 * @file Cosmoscope displaying
 * @author Guillaume Brioudes
 * @copyright MIT License ANR HyperOtlet
 */

const {
        app, // app event lifecycle, events
        BrowserWindow, // app windows generator
        Menu // top bar menu manager
    } = require('electron')
    , path = require('path')
    , fs = require('fs');

const state = require('./models/state');

let window = new BrowserWindow ({
    width: 1200,
    height: 600,
    show: false,
    icon: path.join(__dirname, '../assets/icons/64x64.png'),
    webPreferences: {
        allowRunningInsecureContent: false,
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false,
        sandbox: true,
        preload: path.join(__dirname, 'controller.js')
    },
    title: 'Cosma'
});

const cosmoscopePath = path.join(app.getPath('userData'), 'cosmoscope.html');

let cosmoscope;

function cosmoscopeGenerationDisplaying () {
    switch (state.needConfiguration()) {

        /**
         * If the config is not complete or contain errors
         * the app show the exemple graph while waiting for a valid config
         */
    
        case true:
            const exempleGraph = require('./data/exemple-graph');
            cosmoscope = require('./models/template')(exempleGraph.files, exempleGraph.entities);
            break;
    
        case false:
            const graph = require('./models/graph')()
            cosmoscope = require('./models/template')(graph.files, graph.entities);
            break;
    }
    
    fs.writeFileSync(cosmoscopePath, cosmoscope);
    window.loadFile(cosmoscopePath);
}
exports.cosmoscopeGenerationDisplaying = cosmoscopeGenerationDisplaying;
cosmoscopeGenerationDisplaying();

const appMenu = require('./models/menu');
Menu.setApplicationMenu(appMenu);

window.once('ready-to-show', () => {
    window.show();
})