import { getExtendedSettings } from "./lazyload.defaults";
import { autoInitialize } from "./lazyload.autoInitialize";
import { load } from "./lazyload.load";
import { setObserver, observeElements, resetObserver } from "./lazyload.intersectionObserver";
import { isBot, runningOnBrowser } from "./lazyload.environment";
import { shouldUseNative, loadAllNative } from "./lazyload.native";
import { setOnlineCheck } from "./lazyload.online";
import { getElementsToLoad } from "./lazyload.dom";

const LazyLoad = function(customSettings, elements) {
    this._settings = getExtendedSettings(customSettings);
    this.loadingCount = 0;
    setObserver(this);
    setOnlineCheck(this);
    this.update(elements);
};

LazyLoad.prototype = {
    update: function(givenNodeset) {
        const settings = this._settings;
        const elementsToLoad = getElementsToLoad(givenNodeset, settings);
        this.toLoadCount = elementsToLoad.length;

        if (isBot || !this._observer) {
            this.loadAll(elementsToLoad);
            return;
        }
        if (shouldUseNative(settings)) {
            loadAllNative(elementsToLoad, this);
            return;
        }

        resetObserver(this._observer);
        observeElements(this._observer, elementsToLoad);
    },

    destroy: function() {
        // Observer
        if (this._observer) {
            this._observer.disconnect();
        }
        delete this._observer;
        delete this._settings;
        delete this.loadingCount;
        delete this.toLoadCount;
    },

    loadAll: function(elements) {
        const settings = this._settings;
        const elementsToLoad = getElementsToLoad(elements, settings);
        elementsToLoad.forEach(element => {
            load(element, settings, this);
        });
    }
};

LazyLoad.load = (element, customSettings) => {
    const settings = getExtendedSettings(customSettings);
    load(element, settings);
};

/* Automatic instances creation if required (useful for async script loading) */
if (runningOnBrowser) {
    autoInitialize(LazyLoad, window.lazyLoadOptions);
}

export default LazyLoad;
