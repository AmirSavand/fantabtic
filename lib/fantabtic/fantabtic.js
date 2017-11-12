/**
 * App module
 */
var app = angular.module("fantabtic", []);

/**
 * App config
 */
app.config(function ($compileProvider) {

  // Whitelist URLs
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome|chrome-extension):/);
});

/**
 * MainController
 */
app.controller("MainController", function (TopSite, App, Storage, $scope, $rootScope, $http, $timeout, $interval) {

  /**
   * Load API data via settings
   */
  function load() {

    // Get top sites
    if ($scope.settings.topSites) {
      chrome.topSites.get(function (data) {
        // Create instance
        angular.forEach(data, function (site) {
          $scope.topSites.push(new TopSite(site));
        });
        // Update template
        $scope.$apply();
      });
    }

    // Get apps
    if ($scope.settings.apps) {
      chrome.management.getAll(function (data) {
        // Create instance
        angular.forEach(data, function (app) {
          $scope.apps.push(new App(app));
        });
        // Update template
        $scope.$apply();
      });
    }

    // Get a quote
    if ($scope.settings.quote) {
      $http.get("http://quotes.rest/qod.json?category=inspire", { cache: true }).then(function (data) {
        $scope.quote = data.data.contents.quotes[0];
      });
    }

    // Get a wallpaper
    if (!$scope.settings.wallpaper) {
      $http.get("https://bing.com/HPImageArchive.aspx?format=js&idx=0&n=1", { cache: true }).then(function (data) {
        $scope.wallpaper = "http://bing.com" + data.data.images[0].url;
      });
    } else {
      $scope.wallpaper = $scope.settings.wallpaper;
    }

    // Template rendered
    $timeout(function () {

      // Initial tooltips
      $("[data-tooltip]").tooltip();

      // Show images when loaded
      angular.element("img").on("load error", function (event) {

        // Show image
        angular.element(this).animate({ opacity: 1 });

        // Fallback image when error
        if (event.type == "error") {
          angular.element(this).attr("src", "http://placehold.it/100x100/ddd/ddd");
        }
      });
    });
  }

  function constructor() {

    /**
     * App settings
     *
     * @type {object}
     */
    $scope.settings = [];

    /**
     * Top visited sites
     *
     * @type {Array}
     */
    $scope.topSites = [];

    /**
     * Installed apps and extensions
     *
     * @type {Array}
     */
    $scope.apps = [];

    /**
     * Used to hide rest of sites
     *
     * @type {number}
     */
    $scope.topSitesLimit = 9;

    /**
     * Quote
     *
     * @type {object}
     */
    $scope.quote = {};

    /**
     * Digital clock
     *
     * @type {Date}
     */
    $scope.date = new Date();
  }

  /**
   * On settings change/init
   *
   * @event Fantabtic.MenuController:changeSetting
   *
   * @param {Event} event
   * @param {object} settings
   */
  $rootScope.$on("Fantabtic.MenuController:changeSetting", function (event, settings) {
    $scope.settings = settings;
    load();
  });

  /**
   * Show all sites and do not limit
   */
  $scope.viewAllSites = function () {
    $scope.topSitesLimit = $scope.topSites.length;
  };

  /**
   * Show menu modal
   */
  $scope.showMenu = function () {
    angular.element("#menu").modal();
  };

  // Add to body when finished loading
  angular.element(".wallpaper").on("load", function () {
    angular.element("body").css("background-image", "url(" + angular.element(this).attr("src") + ")");
    angular.element("body").addClass("loaded");
  });

  // Updadate time and date every 10 seconds
  $interval(function () {

    // Update date
    $scope.date = new Date();
  }, 10000);

  constructor();
});

/**
 * MenuController
 */
app.controller("MenuController", function (Storage, $scope, $rootScope) {

  function constructor() {

    /**
     * @type {object}
     */
    $scope.settings = {};

    /**
     * @type {string}
     */
    $scope.version = chrome.runtime.getManifest().version;

    /**
     * @type {string}
     */
    $scope.mailto = "mailto:amir@savandbros.com?subject=Feedback - Fantabtic " + $scope.version;

    /**
     * List of default settings
     * @type {Array}
     */
    $scope.defaultSettingFields = {
      date: {
        value: true,
        label: "Show date"
      },
      time: {
        value: true,
        label: "Show time"
      },
      quote: {
        value: true,
        label: "Show daily quotes"
      },
      topSites: {
        value: true,
        label: "Show top visited sites"
      },
      topSitesViewMore: {
        value: true,
        label: "Show view more for top visited sites"
      },
      apps: {
        value: true,
        label: "Show apps"
      },
      wallpaper: {
        value: "",
        label: "Custom background URL (leave blank for daily background)",
        placeholder: "Enter image URL here"
      }
    };

    /**
     * List of settings
     * @type {Array}
     */
    $scope.settingFields = angular.copy($scope.defaultSettingFields);

    // Update setting fields
    Storage.get("settings", function (data) {

      // Check if got settings
      var isInstantiated = Object.keys(data).length > 0;

      // Got settings
      if (isInstantiated) {

        // Get the value for each setting from storage
        angular.forEach(data.settings, function (setting, key) {
          $scope.settings[key] = setting;
          $scope.settingFields[key].value = setting;
        });
      }

      // No settings, need to initialize
      else {

        // Get all default field values
        angular.forEach($scope.defaultSettingFields, function (setting, key) {
          $scope.settings[key] = setting.value;
        });

        // Save all setings
        Storage.set("settings", $scope.settings);
      }

      // Broadcast update
      $rootScope.$broadcast("Fantabtic.MenuController:changeSetting", $scope.settings);

      // Update template
      $scope.$apply();
    });
  }

  /**
   * Reset to default settings and broadcast
   */
  $scope.resetToDefault = function () {

    // Reset all setting values to default
    angular.forEach($scope.defaultSettingFields, function (setting, key) {
      $scope.settings[key] = setting.value;
      $scope.settingFields[key].value = setting.value;
    });

    // Save settings
    Storage.set("settings", $scope.settings);

    // Broadcast update
    $rootScope.$broadcast("Fantabtic.MenuController:changeSetting", $scope.settings);
  };

  /**
   * Update storage on setting value changed and broadcast
   *
   * @param {string} key 
   */
  $scope.changeSetting = function (key) {

    // Update setting variable
    $scope.settings[key] = $scope.settingFields[key].value;

    // Update storage
    Storage.set("settings", $scope.settings);

    // Broadcast update
    $rootScope.$broadcast("Fantabtic.MenuController:changeSetting", $scope.settings);
  };

  constructor();
});

/**
 * Storage class
 */
app.service("Storage", function () {

  /**
   * @private
   */
  var self = this;

  /**
   * Set a pair of key value
   *
   * @param {string} key
   * @param {any} value
   * @param {function} callback
   */
  self.set = function (key, value, callback) {

    // Default
    callback = callback || function () {};

    // Prepare object to save
    var object = {};
    object[key] = value;

    // Save/update to storage
    chrome.storage.sync.set(object, callback);
  };

  /**
   * Get the value of a specific key from storage
   *
   * @param {string} key
   * @param {function} callback 
   */
  self.get = function (key, callback) {
    chrome.storage.sync.get(key, callback);
  };

  /**
   * Reset storage and delete all objects
   */
  self.reset = function (callback) {

    // Default
    callback = callback || function () {};

    // Reset storage
    chrome.storage.sync.clear(callback);
  };

  /**
   * Last run time error
   *
   * @returns {object}
   */
  self.error = function () {
    return chrome.runtime.lastError;
  };
});

/**
 * TopSite class
 */
app.service("TopSite", function () {
  return function (data) {

    /**
     * @private
     */
    var self = this;

    /**
     * @type {string}
     */
    self.title = data.title;

    /**
     * @type {string}
     */
    self.url = data.url;

    /**
     * @type {string}
     */
    self.hostname = new URL(data.url).hostname;

    /**
     * @type {string}
     */
    self.image = "https://logo.clearbit.com/" + self.hostname + "?s=80";
  };
});

/**
 * App class
 */
app.service("App", function ($window) {
  return function (data) {

    /**
     * @private
     */
    var self = this;

    /**
     * @type {string}
     */
    self.id = data.id;

    /**
     * @type {string}
     */
    self.optionsUrl = data.optionsUrl;

    /**
     * @type {string}
     */
    self.type = data.type;

    /**
     * @type {string}
     */
    self.name = data.name;

    /**
     * List of available icons
     *
     * @type {Array}
     */
    self.icons = data.icons;


    /**
     * Get a suitable icon URL
     *
     * @type {function}
     * @returns {string} URL of icon
     */
    self.getIcon = function () {

      var url;

      // If has any icon
      if (!self.icons) {
        return;
      }

      // Find 32 icon or larger
      angular.forEach(self.icons, function (icon) {
        if (!url && icon.size >= 32) {
          url = icon.url;
        }
      });

      // Just get the last one
      if (!url) {
        url = self.icons[self.icons.length - 1].url;
      }
      return url;
    };

    /**
     * Lauch app if not an extension
     *
     * @type {function}
     */
    self.launch = function () {
      if (self.type !== "extension") {
        chrome.management.launchApp(self.id);
      }
    };
  };
});
