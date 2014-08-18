var MobileUtils = {
    MOBILE_MAX_WIDTH:600,

    isMobile: function(){
        if (typeof this._isMobile === 'boolean'){
            return this._isMobile;
        }
        var screenWidth = this.getScreenWidth();
        var isMobileScreenSize = screenWidth < this.MOBILE_MAX_WIDTH;

        if(this.isTouchScreen() || this.isMSMobileDevice()){
            this._isMobile = isMobileScreenSize && true;
        } else {
            this._isMobile = false;
        }

        return this._isMobile;
    },

    getScreenWidth: function () {
        var sizes = this._getDeviceParamsByUA();
        if(sizes && sizes.width){
            return sizes.width;
        }
        return false;
    },

    getScreenHeight: function () {
        var sizes = this._getDeviceParamsByUA();
        if (sizes && sizes.height) {
            return sizes.height;
        }
        return false;
    },

    isAppleMobileDevice: function(){
        return (/iphone|ipod|ipad|Macintosh/i.test(navigator.userAgent.toLowerCase()));
    },

    isMobileApp: function(){
        return (window.location.search.indexOf('ismobileapp=') >= 0);
    },

    isMSMobileDevice: function(){
    return (/iemobile/i.test(navigator.userAgent.toLowerCase()));
    },

    isAndroidMobileDevice:function(){
        return (/android/i.test(navigator.userAgent.toLowerCase()));
    },

    isNewChromeOnAndroid:function(){
        if(this.isAndroidMobileDevice()){
            var userAgent = navigator.userAgent.toLowerCase();
            if((/chrome/i.test(userAgent))){
                var parts = userAgent.split('chrome/');

                var fullVersionString = parts[1].split(" ")[0];
                var versionString = fullVersionString.split('.')[0];
                var version = parseInt(versionString);

                if(version >= 27){
                    return true;
                }
            }
        }
        return false;
    },

    isTouchScreen: function(){
        return (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    },

    isViewportOpen: function() {
        return !!document.getElementById('wixMobileViewport');
    },

    fixViewportScale: function (siteWidth) {
        var width = siteWidth || 320;
        var screenHeight = this.getScreenHeight();
        var screenWidth = this.getScreenWidth();
        var viewportScale = 1.0;
        var isPortrait = this.isPortrait();
        if (!isPortrait) {
            viewportScale = screenHeight / width;
        } else {
            viewportScale = screenWidth / width;
        }
        this.setViewportTag(width, viewportScale);
    },

    setViewportTag: function (width, viewportScale) {
        var viewPort = document.getElementById('wixMobileViewport');
        if (!viewPort) {
            return;
        }
        var falseWidth;
        var needsAndroidBrowserWorkaround = this.isAndroidOldBrowser();

        if (typeof width == 'number' || toString.call(width) == '[object Number]') {
            falseWidth = width + 1;
        } else {
            falseWidth = width;
        }

        this.writeToViewportTag(viewPort, falseWidth, viewportScale);
        if (!needsAndroidBrowserWorkaround) {
            setTimeout(function () {
                this.writeToViewportTag(viewPort, width, viewportScale);
            }.bind(this), 50);
        }
    },

    writeToViewportTag: function (viewPort, width, scale) {
        var contentString = 'width=' + width + ', initial-scale=' + scale + ', maximum-scale=' + scale;
        if(this._getEnvData().$viewingDevice!=="DESKTOP") {
            contentString += ', user-scalable=no';
        }

        this.setViewportContent(contentString, viewPort);

        if (window.WQuickActions) {
            window.WQuickActions.delayedFixZoom();
        }
    },

    setViewportContent: function (contentString, viewPort) {
        viewPort = viewPort || document.getElementById('wixMobileViewport');
        if(!viewPort) {
            return;
        }
        viewPort.setAttribute('content', contentString);
    },

    getViewportContent: function (viewPort) {
        viewPort = viewPort || document.getElementById('wixMobileViewport');
        if(!viewPort) {
            return;
        }
        return viewPort.getAttribute('content');
    },

    _getEnvData: function() {
        if(window.W && window.W.Config && window.W.Config.env) {
            return window.W.Config.env;
        }
        return {};
    },

    isPortrait: function () {
        var orientation = window.orientation;
        return (!orientation || orientation === 0 || orientation === 180);
    },

    isAndroidOldBrowser: function () {
        var isChrome = (/chrome/i.test(navigator.userAgent.toLowerCase()));

        if(this.isAndroidMobileDevice() && !isChrome) {
            return true;
        }

        return false;
    },

    _getDevicePixelRatio: function(){
        if(this.isMSMobileDevice()){
            return Math.round(window.screen.availWidth / document.documentElement.clientWidth);
        }
        return window.devicePixelRatio;
    },

    getInitZoom: function(){
        if(!this._initZoom || this._initZoom < 0 || this._initZoom > 5){
            var screenWidth = this.getScreenWidth();
            this._initZoom = screenWidth /document.body.offsetWidth;
        }
        return this._initZoom;
    },

    getZoom: function(){
        var screenWidth = (!this.isPortrait()) ? this.getScreenHeight() : this.getScreenWidth();
        return (screenWidth / window.innerWidth);
    },

    _getDeviceParamsByUA: function getDeviceParamsByUA(){
        if (!(navigator && navigator.userAgent)) {
            return false;
        }
        var ua = navigator.userAgent.toLowerCase();

        var specificAndroidParams = this._paramsForSpecificAndroidDevices(ua);

        var width = Math.min(screen.width, screen.height);
        var height = Math.max(screen.width, screen.height);
        if (specificAndroidParams) {
            width = specificAndroidParams.width;
            height = specificAndroidParams.height;
        }

        switch (true) {
            case /ip(hone|od|ad)/i.test(ua):
                break;
            case /android/i.test(ua):
                if (!this.isNewChromeOnAndroid() || specificAndroidParams) {
                    width = width / this._getDevicePixelRatio();
                    height = height / this._getDevicePixelRatio();
                }
                break;
            case /iemobile/i.test(ua):
                width = document.documentElement.clientWidth;
                height = document.documentElement.clientHeight;
                break;
            default:
//                    width =  screen.width;
//                    height = screen.height;
                break;
        }
        return {width: width, height: height};
    },

    _paramsForSpecificAndroidDevices: function (userAgent) {
        switch (true) {
            case (/(GT-S5300B|GT-S5360|GT-S5367|GT-S5570I|GT-S6102B|LG-E400f|LG-E400g|LG-E405f|LG-L38C|LGL35G)/i).test(userAgent):
                return {width: 240, height: 320};
            case (/(Ls 670|GT-S5830|GT-S5839i|GT-S6500D|GT-S6802B|GT-S7500L|H866C|Huawei-U8665|LG-C800|LG-MS695|LG-VM696|LGL55C|M865|Prism|SCH-R720|SCH-R820|SCH-S720C|SPH-M820-BST|SPH-M930BST|U8667|X501_USA_Cricket|ZTE-Z990G)/i).test(userAgent):
                return {width: 320, height: 480};
            case (/(5860E|ADR6300|ADR6330VW|ADR8995|APA9292KT|C771|GT-I8160|GT-I9070|GT-I9100|HTC-A9192|myTouch4G|N860|PantechP9070|PC36100|pcdadr6350|SAMSUNG-SGH-I727|SAMSUNG-SGH-I777|SAMSUNG-SGH-I997|SC-03D|SCH-I405|SCH-I500|SCH-I510|SCH-R760|SGH-S959G|SGH-T679|SGH-T769|SGH-T959V|SGH-T989|SPH-D700)/i).test(userAgent):
                return {width: 480, height: 800};
            case (/(DROIDX|SonyEricssonSO-02C|SonyEricssonST25i)/i).test(userAgent):
                return {width: 480, height: 854};
            case (/(DROID3|MB855)/i).test(userAgent):
                return {width: 540, height: 960};
            case (/F-05D/i).test(userAgent):
                return {width: 720, height: 1280};
            default:
                return false;
        }
    }
};

(function(){
    var tempScope = {};
    // copied temporarily from isExperimentOpen.js in the bootstrap project (for the experiment)
    (function(scope) {
        var f = scope.isExperimentOpen = function(experimentName) {
            if (typeof experimentName !== 'string') {
                throw new Error('experimentName argument must be a string, received: ' + JSON.stringify(experimentName));
            }

            if (window.W && window.W.Experiments) {
                return window.W.Experiments.isDeployed(experimentName);
            }

            function createDict() {
                return (Object.create && Object.create(null)) || {};
            }

            function getExperimentsFromQueryString(qs) {
                qs = qs || window.location.search;
                var regExp = /[&?]experiment=([^&:]+)(?:[:]([^&]+))?/ig,
                    match, name, value, result = createDict();

                while(match = regExp.exec(qs)) {
                    name = match[1].toLowerCase();
                    value = match[2];
                    result[name] = !value || value.toLowerCase() === 'new';
                }

                return result;
            }

            f.queryStringExperiments = f.queryStringExperiments || getExperimentsFromQueryString();

            experimentName = experimentName.toLowerCase();

            var experimentInQueryString = f.queryStringExperiments[experimentName];

            if (experimentInQueryString !== undefined) {
                return experimentInQueryString === true;
            }

            function modelToExperimentsSet(obj) {
                var result = createDict(), val;
                for(var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        val = obj[key];
                        if (typeof val === 'string' && val.toLowerCase() === 'new') {
                            result[key.toLowerCase()] = true;
                        }
                    }
                }

                return result;
            }

            function getExperimentsFromModel() {
                var model = window.rendererModel || window.editorModel || {};
                return modelToExperimentsSet(model.runningExperiments);
            }

            f.modelExperiments = f.modelExperiments || getExperimentsFromModel();

            return !!f.modelExperiments[experimentName];
        };
    })(tempScope);

    // TODO: modify to more generic approach or DIE ;)
    if(tempScope.isExperimentOpen('mobileactionsmenu')){
        MobileUtils.earlyIsExperimentOpen = function(experimentName){
            return tempScope.isExperimentOpen(experimentName);
        };
    }
})();

if (!Function.prototype.bind) {
    Function.prototype.bindContextForMobile = function (oThis) {
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            FNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof FNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };
} else {
    Function.prototype.bindContextForMobile = Function.prototype.bind;
}

if (!document.getElementsByClassName) {
  document.getElementsByClassNameForMobile = function(search) {
    var d = document, elements, pattern, i, results = [];
    if (d.querySelectorAll) { // IE8
      return d.querySelectorAll("." + search);
    }
    if (d.evaluate) { // IE6, IE7
      pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
      elements = d.evaluate(pattern, d, null, 0, null);
      while ((i = elements.iterateNext())) {
        results.push(i);
      }
    } else {
      elements = d.getElementsByTagName("*");
      pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
      for (i = 0; i < elements.length; i++) {
        if ( pattern.test(elements[i].className) ) {
          results.push(elements[i]);
        }
      }
    }
    return results;
  };
}else{
    document.getElementsByClassNameForMobile = document.getElementsByClassName;
}