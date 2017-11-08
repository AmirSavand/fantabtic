// App
var app = angular.module("fantabtic", []);

// Main Controller
app.controller("MainController", function (TopSite, $scope, $http, $timeout) {

  function constructor() {

    /**
     * @desc Top visited sites
     * @type {Array}
     */
    $scope.topSites = [];

    /**
     * @desc Quote
     * @type {object}
     */
    $scope.quote = {};

    // Get top sites
    chrome.topSites.get(function (data) {

      // Create instance
      angular.forEach(data, function (site) {
        $scope.topSites.push(new TopSite(site));
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
  }

  // Add to body when finished loading
  angular.element(".wallpaper").on("load", function () {
    angular.element("body").css("background-image", "url(" + angular.element(this).attr("src") + ")");
    angular.element("body").addClass("loaded");
  });

  // Template rendered
  $timeout(function () {

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
  }
});

app.service("Cache", function () {

  var self = this;

  self.data = {};

});
