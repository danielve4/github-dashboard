(function() {
  var sortSelect = document.getElementById('sort-select');
  var sortBy;
  var displayOnly = {
    'issues':true,
    'watchers':true,
    'forks':true,
    'commits':true
  };

  var requestOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'danielve4',
      'Authorization':'token '
    }
  };

  var reposInfo;
  var stats = 'stats-json-ex.json';
  var repo = 'repo-json-ex.json';

  function loadRepoInfo(stats, repo, callback) {
    var readyCount = 0;
    var info = {
      'issues':'',
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
        sort();
        callback();
      }
    });
    getRepoStats(stats, function (json) {
      var sumCommits = json.all.reduce(function(a, b){return a+b},0);
      info.commits = sumCommits;
      readyCount++;
      if(readyCount===2) {
        reposInfo.push(info);
        sort();
        callback();
      }
    });
  }

  function addRepoInfo() {
    sort();
    document.querySelector('#all-repos-info').innerHTML = '';
    var mainUl = document.querySelector('#all-repos-info');

    for(var i=0;i<reposInfo.length ;i++) {
      var mainUlLi = document.createElement('li');
      mainUl.appendChild(mainUlLi);
      var ulStats = document.createElement('ul');
      ulStats.className = 'card';
      if (displayOnly.issues === true) {
        var openIssuesCount = document.createElement('li');
        openIssuesCount.innerHTML = 'Open Issues: ' + reposInfo[i].issues;
        ulStats.appendChild(openIssuesCount);
      }
      if (displayOnly.watchers === true) {
        var watchersCount = document.createElement('li');
        watchersCount.innerHTML = 'Watchers: ' + reposInfo[i].watchers;
        ulStats.appendChild(watchersCount);
      }
      if (displayOnly.forks === true) {
        var forksCount = document.createElement('li');
        forksCount.innerHTML = 'Forks: ' + reposInfo[i].forks;
        ulStats.appendChild(forksCount);
      }
      if (displayOnly.commits === true) {
        var commitCount = document.createElement('li');
        commitCount.innerHTML = 'Commits: ' + reposInfo[i].commits;
        ulStats.appendChild(commitCount);
      }
      mainUlLi.appendChild(ulStats);
    }
    console.log('Reloaded: ' + sortBy);
  }

  function loadAndDisplay() {
    reposInfo = [];
    var infoComplete = 0;
    for (var j = 0; j < 4; j++) {
      loadRepoInfo(stats, repo, function () {
        infoComplete++;
        if (infoComplete === 4) {
          addRepoInfo();
        }
      });
    }
  }


  function sort() {
    sortBy = sortSelect.value;
    reposInfo.sort(function(a, b) {
      return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
    });
  }

  for(var i=0;i<2;i++) {
    (function(i){
      window.setTimeout(function(){
        loadAndDisplay();
      }, i * 1000);
    }(i));
  }

  sortSelect.addEventListener('change', addRepoInfo, false);





  function getRepoInfo(repoUrl, callback) {
    var repoRequest = new Request(repoUrl, requestOptions);
    fetch(repoRequest)
      .then(function(response) {
        return response.json();
      })
      .then(function(json) {
        callback(json);
      });
  }

  function getRepoStats(repoUrl, callback) {
    var repoRequest = new Request(repoUrl, requestOptions);
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

})();
