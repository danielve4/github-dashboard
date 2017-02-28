// $.noConflict();
// jQuery(function($) {
// });

(function() {
  var options = {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'danielve4',
      'Authorization':'token 79d0937c5d9f7bfa769610a8984cb86427ee033e'
    }
  };

  function getRepoInfo(repoUrl, callback) {
    var repoRequest = new Request(repoUrl, options);
    fetch(repoRequest)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        callback(json);
      });
  }

  function getRepoStats(repoUrl, callback) {
    var repoRequest = new Request(repoUrl, options);
    fetch(repoRequest)
      .then(function(response) {
        if(response.status === 200) {
          response.json().then(function(json) {
            callback(json);
          });
        } else if(response.status === 202) {
          window.setTimeout(function () {
            getRepoStats(repoUrl, callback);
          }, 2000);
        }
      });
  }

  var openIssuesCount = document.querySelector('#open-issues-count');
  var watchersCount = document.querySelector('#watchers-count');
  var forksCount = document.querySelector('#forks-count');
  getRepoInfo('repo-json-ex.json', function (json) {
    openIssuesCount.innerHTML = json.open_issues_count;
    watchersCount.innerHTML = json.subscribers_count;
    forksCount.innerHTML = json.forks_count;
    console.log(json);
  });

  // getRepoInfo('repo-json-ex.json',function (json) {
  //   console.log(json);
  // });

})();
