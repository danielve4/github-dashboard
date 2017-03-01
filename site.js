(function() {
  var repositories = [
    // 'facebook/react',
    // 'angular/angular.js',
    'emberjs/ember.js',
    'vuejs/vue'
  ];
  var sortSelect = document.getElementById('sort-select');
  var filterStatsBy = document.getElementById('filter-stats-by');
  var statsCheckBoxes = filterStatsBy.getElementsByTagName('input');
  var filterRepos = document.getElementById('filter-repos-by');
  var reposDisplayOptions = {};
  var reposDisplaySet = false;

  var statsDisplayOptions = {
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
  var sortBy;

  sortSelect.addEventListener('change', addRepoInfo, false);

  for(var i=0;i<0;i++) {
    (function(i){
      window.setTimeout(function(){
        loadAndDisplay();
      }, i * 5000);
    }(i));
  }

  for (var c=0; c<statsCheckBoxes.length; c++) {
    statsCheckBoxes[c].onclick = function() {
      if(this.checked) {
        statsDisplayOptions[this.value] = true;
      } else {
        statsDisplayOptions[this.value] = false;
      }
      addRepoInfo();
    }
  }

  function loadAndDisplay() {
    reposInfo = [];
    var infoComplete = 0;
    for (var j = 0; j < repositories.length; j++) {
      loadRepoInfo(repositories[j], function () {
        infoComplete++;
        if (infoComplete === repositories.length) {
          addRepoInfo();
          reposDisplaySet = true;
        }
      });
    }
  }

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
      if(!reposDisplaySet) {
        addReposCheckBoxes(json.name);
      }
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
    var rankNum = 1;
    for(var i=0;i<reposInfo.length ;i++) {
      if(reposDisplayOptions[reposInfo[i].name]) {
        var mainUlLi = document.createElement('li');
        mainUlLi.className = 'card';
        mainUl.appendChild(mainUlLi);
        var ulStats = document.createElement('ul');
        ulStats.className = 'stats';
        var repoName = document.createElement('h2');
        repoName.innerHTML = rankNum+'. '+reposInfo[i].name;
        rankNum++;
        ulStats.appendChild(repoName);
        if (statsDisplayOptions.issues === true) {
          var openIssuesCount = document.createElement('li');
          openIssuesCount.innerHTML = 'Open Issues: ' + reposInfo[i].issues;
          ulStats.appendChild(openIssuesCount);
        }
        if (statsDisplayOptions.watchers === true) {
          var watchersCount = document.createElement('li');
          watchersCount.innerHTML = 'Watchers: ' + reposInfo[i].watchers;
          ulStats.appendChild(watchersCount);
        }
        if (statsDisplayOptions.forks === true) {
          var forksCount = document.createElement('li');
          forksCount.innerHTML = 'Forks: ' + reposInfo[i].forks;
          ulStats.appendChild(forksCount);
        }
        if (statsDisplayOptions.commits === true) {
          var commitCount = document.createElement('li');
          commitCount.innerHTML = 'Commits: ' + reposInfo[i].commits;
          ulStats.appendChild(commitCount);
        }
        mainUlLi.appendChild(ulStats);
      }
    }
    console.log('Reloaded: ' + sortBy);
    console.log(reposInfo);
  }

  function sort() {
    sortBy = sortSelect.value;
    reposInfo.sort(function(a, b) {
      return parseFloat(b[sortBy]) - parseFloat(a[sortBy]);
    });
  }

  function addReposCheckBoxes(repoName) {
    reposDisplayOptions[repoName] = true;
    var repoLi = document.createElement('li');
    var repoLabel = document.createElement('label');
    repoLabel.setAttribute('for',repoName+'-check');
    repoLabel.innerHTML = repoName;
    repoLi.appendChild(repoLabel);
    var repoCheck = document.createElement('input');
    repoCheck.setAttribute('type','checkbox');
    repoCheck.setAttribute('id',repoName+'-check');
    repoCheck.setAttribute('value',repoName);
    repoCheck.setAttribute('checked','checked');
    repoCheck.onclick = function() {
      reposDisplayOptions[this.value] = this.checked;
      addRepoInfo();
    };
    repoLi.appendChild(repoCheck);
    filterRepos.appendChild(repoLi);
  }

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
