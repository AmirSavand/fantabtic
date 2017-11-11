// App
var app = angular.module("fantabtic", []);

// Aoo config
app.config(function ($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome|chrome-extension):/);
});

// Main Controller
app.controller("MainController", function (TopSite, App, $scope, $http, $timeout, $interval) {

  function constructor() {

    /**
     * @desc Top visited sites
     * @type {Array}
     */
    $scope.topSites = [];

    /**
     * @desc Installed apps and extensions
     * @type {Array}
     */
    $scope.apps = [];

    /**
     * @desc Used to hide rest of sites
     * @type {number}
     */
    $scope.topSitesLimit = 9;

    /**
     * @desc Quote
     * @type {object}
     */
    $scope.quote = {};

    /**
     * @desc Digital clock
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

    // Upda$intervalte time
    $interval(function () {
      $scope.date = new Date();
    }, 10000);
  }

  $scope.viewAllSites = function () {
    $scope.topSitesLimit = $scope.topSites.length;
  };

  // Add to body when finished loading
  angular.element(".wallpaper").on("load", function () {
    angular.element("body").css("background-image", "url(" + angular.element(this).attr("src") + ")");
    angular.element("body").addClass("loaded");
  });

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
        angular.element(this).attr("src", "http://placehold.it/100x100/ddd/ddd")
      }
    });
  });

  constructor();
});

app.service("TopSite", function () {
  return function (data) {

    var self = this;

    self.title = data.title;

    self.url = data.url;

    self.hostname = new URL(data.url).hostname;

    self.image = "https://logo.clearbit.com/" + self.hostname + "?s=80";
  };
});

app.service("App", function ($window) {
  return function (data) {

    var self = this;

    self.id = data.id;

    self.optionsUrl = data.optionsUrl;

    self.type = data.type;

    self.name = data.name;

    self.icons = data.icons;

    self.getIcon = function () {

      var url;

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

    self.launch = function () {

      // Not an extension
      if (self.type !== "extension") {
        return chrome.management.launchApp(self.id);
      }
    };
  };
});
