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
app.controller("MainController", function (TopSite, App, $scope, $http, $timeout, $interval) {

  function constructor() {

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

    // Get top sites
    chrome.topSites.get(function (data) {

      // Create instance
      angular.forEach(data, function (site) {
        $scope.topSites.push(new TopSite(site));
      });

      // Update template
      $scope.$apply();
    });
  /**
   * Show menu modal
   */
  $scope.showMenu = function () {
    angular.element("#menu").modal();
  };

    // Get apps
    chrome.management.getAll(function (data) {

      // Create instance
      angular.forEach(data, function (app) {
        $scope.apps.push(new App(app));
      });

      // Update template
      $scope.$apply();
    });

    // Get a quote
    $http.get("http://quotes.rest/qod.json?category=inspire", { cache: true }).then(function (data) {
      $scope.quote = data.data.contents.quotes[0];
    });

    // Get a wallpaper
    $http.get("https://bing.com/HPImageArchive.aspx?format=js&idx=0&n=1", { cache: true }).then(function (data) {
      $scope.wallpaper = "http://bing.com" + data.data.images[0].url;
    });

    // Updadate time and date every 10 seconds
    $interval(function () {

      // Update date
      $scope.date = new Date();
    }, 10000);
  }

  /**
   * Show all sites and do not limit
   */
  $scope.viewAllSites = function () {
    $scope.topSitesLimit = $scope.topSites.length;
  };

  // Add to body when finished loading
  angular.element(".wallpaper").on("load", function () {
    angular.element("body").css("background-image", "url(" + angular.element(this).attr("src") + ")");
    angular.element("body").addClass("loaded");
  });
});

  // Template rendered
  $timeout(function () {
/**
 * Storage class
 */
app.service("Storage", function () {

    // Initial tooltips
    $("[data-tooltip]").tooltip();
  /**
   * @private
   */
  var self = this;

    // Show images when loaded
    angular.element("img").on("load error", function (event) {
  /**
   * Set a pair of key value
   *
   * @param {string} key
   * @param {any} value
   * @param {function} callback
   */
  self.set = function (key, value, callback) {

      // Show image
      angular.element(this).animate({ opacity: 1 });
    // Default
    callback = callback || function () {};

      // Fallback image when error
      if (event.type == "error") {
        angular.element(this).attr("src", "http://placehold.it/100x100/ddd/ddd")
      }
    });
  });
    // Prepare object to save
    var object = {};
    object[key] = value;

  constructor();
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
