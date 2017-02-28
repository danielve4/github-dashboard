(function() {
  var options = {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'danielve4',
      'Authorization':'token '
    }
  };

  var reposInfo = [];

  var stats = 'stats-json-ex.json';
  var repo = 'repo-json-ex.json';

  function loadRepoInfo() {
    var readyCount = 0;
    var info = {
      'openIssues':'',
      'watchers':'',
      'forks':'',
      'commits':''
    };
    getRepoInfo(repo, function (json) {
      info.openIssues = json.open_issues_count;
      info.watchers = json.subscribers_count;
      info.forks = json.forks_count;
      readyCount++;
      if(readyCount===2) {
        reposInfo.push(info);
        addRepoInfo();
      }
    });
    getRepoStats(stats, function (json) {
      var sumCommits = json.all.reduce(function (a, b) {return a+b},0);
      info.commits = sumCommits;
      readyCount++;
      if(readyCount===2) {
        reposInfo.push(info);
        addRepoInfo();
      }
    });
  }

  function addRepoInfo() {
    var mainUl = document.querySelector('#all-repos-info');

    var mainUlLi = document.createElement('li');
    mainUl.appendChild(mainUlLi);
    var ulStats = document.createElement('ul');
    ulStats.className = 'card';

    var openIssuesCount = document.createElement('li');
    var watchersCount = document.createElement('li');
    var forksCount = document.createElement('li');
    var commitCount = document.createElement('li');

    openIssuesCount.innerHTML = 'Open Issues: '+reposInfo[0].openIssues;
    ulStats.appendChild(openIssuesCount);
    watchersCount.innerHTML = 'Watchers: '+reposInfo[0].watchers;
    ulStats.appendChild(watchersCount);
    forksCount.innerHTML = 'Forks: '+reposInfo[0].forks;
    ulStats.appendChild(forksCount);
    commitCount.innerHTML = 'Commits: '+reposInfo[0].commits;
    ulStats.appendChild(commitCount);

    mainUlLi.appendChild(ulStats);
  }
  loadRepoInfo();





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
          }, 3000);
        }
      });
  }

  function addRepoInfoToDoc(repoUrl, statsUrl) {
    var mainUl = document.querySelector('#all-repos-info');

    var mainUlLi = document.createElement('li');
    mainUl.appendChild(mainUlLi);
    var ulStats = document.createElement('ul');
    ulStats.className = 'card';

    var openIssuesCount = document.createElement('li');
    var watchersCount = document.createElement('li');
    var forksCount = document.createElement('li');
    var commitCount = document.createElement('li');

    getRepoInfo(repoUrl, function (json) {
      openIssuesCount.innerHTML = 'Open Issues: '+json.open_issues_count;
      ulStats.appendChild(openIssuesCount);
      watchersCount.innerHTML = 'Watchers: '+json.subscribers_count;
      ulStats.appendChild(watchersCount);
      forksCount.innerHTML = 'Forks: '+json.forks_count;
      ulStats.appendChild(forksCount);
      console.log(json);
    });
    getRepoStats(statsUrl, function (json) {
      var sumCommits = json.all.reduce(function (a, b) {return a+b},0);
      commitCount.innerHTML = 'Commits: '+sumCommits;
      ulStats.appendChild(commitCount);
      console.log(json);
    });
    mainUlLi.appendChild(ulStats);
  }

  function addAllInfoToDoc() {
    var stats = 'stats-json-ex.json';
    var repo = 'repo-json-ex.json';
    document.querySelector('#all-repos-info').innerHTML = '';

    for(var j=0;j<4;j++) {
      addRepoInfoToDoc(repo, stats);
    }
  }

  // for(var i=0;i<2;i++) {
  //   (function(i){
  //     window.setTimeout(function(){
  //       addAllInfoToDoc()
  //     }, i * 2000);
  //   }(i));
  // }

})();
