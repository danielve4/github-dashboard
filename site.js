(function() {
  var repositories = [
    // 'facebook/react',
    // 'angular/angular.js',
    // 'emberjs/ember.js',
    'vuejs/vue'
  ];
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
      'Accept': 'application/vnd.github.v3+json'
      //'User-Agent': 'danielve4'
      ///'Authorization':'token '
    }
  };

  var reposInfo;

  function loadRepoInfo(repoPath, callback) {
    var repoUrl = 'http://api.github.com/repos/'+repoPath;
    var readyCount = 0;
    var info = {
      'name':'',
      'issues':'',
      'watchers':'',
      'forks':'',
      'commits':''
    };
    getRepoInfo(repoUrl, function (json) {
      info.name = json.name;
      info.issues = json.open_issues_count;
      info.watchers = json.subscribers_count;
      info.forks = json.forks_count;
      readyCount++;
      if(readyCount===2) {
        reposInfo.push(info);
        callback();
      }
    });
    getRepoStats(repoUrl+'/stats/participation', function (json) {
      var sumCommits = json.all.reduce(function(a, b){return a+b},0);
      info.commits = sumCommits;
      readyCount++;
      if(readyCount===2) {
        reposInfo.push(info);
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
      var repoName = document.createElement('h2');
      repoName.innerHTML = reposInfo[i].name;
      ulStats.appendChild(repoName);
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
    console.log(reposInfo);
  }

  function loadAndDisplay() {
    reposInfo = [];
    var infoComplete = 0;
    for (var j = 0; j < repositories.length; j++) {
      loadRepoInfo(repositories[j], function () {
        infoComplete++;
        if (infoComplete === repositories.length) {
          addRepoInfo();
        }
      });
    }
  }


  function sort() {
    sortBy = sortSelect.value;
    reposInfo.sort(function(a, b) {
      return parseFloat(b[sortBy]) - parseFloat(a[sortBy]);
    });
  }

  for(var i=0;i<0;i++) {
    (function(i){
      window.setTimeout(function(){
        loadAndDisplay();
      }, i * 5000);
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

})();
