(function() {
  var reposInfo; //Stores all information of the repositories
  var sortBy;
  var refreshInteval = 30; //In minutes
  var repositories = [ //To add more repositories, just add their path here
    'facebook/react',
    'angular/angular.js',
    'emberjs/ember.js',
    'vuejs/vue'
  ];
  var sortSelect = document.getElementById('sort-select'); //The sort by drop-down menu
  var filterStatsBy = document.getElementById('filter-stats-by'); //Where filter by stat checkboxes are
  var statsCheckBoxes = filterStatsBy.getElementsByTagName('input');//Get all checkboxes
  var filterRepos = document.getElementById('filter-repos-by');//Where filter by repos checkboxes are
  var reposDisplayOptions = {}; //Stores what repos to display
  var reposDisplaySet = false; //Flag to check if the display options have been set

  var statsDisplayOptions = { //What stats to display
    'issues':true,
    'watchers':true,
    'commits':true
  };

  var requestOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  };
  //Listens for change in sorting option
  sortSelect.addEventListener('change', addRepoInfo, false);

  //Updates the stats at set interval, infinite loop
  loadAndDisplay();

  var interval = setInterval(function(){
      loadAndDisplay();
    },(1000*60*refreshInteval));

  //Adds event listeners to stats checkboxes
  for (var c=0; c<statsCheckBoxes.length; c++) {
    statsCheckBoxes[c].onclick = function() {
      statsDisplayOptions[this.value] = this.checked;
      addRepoInfo();
    }
  }
  //Function that calls functions to load data and displays it
  function loadAndDisplay() {
    reposInfo = [];
    var infoComplete = 0;
    for (var j = 0; j < repositories.length; j++) {
      loadRepoInfo(repositories[j], function () {
        infoComplete++;
        if (infoComplete === repositories.length) {
          addRepoInfo();
          var date = new Date();
          document.getElementById('time-updated').innerHTML = date.getHours()+':'+date.getMinutes();
          reposDisplaySet = true;
        }
      });
    }
  }
  //Gets the data from their respective urls
  function loadRepoInfo(repoPath, callback) {
    var repoUrl = 'https://api.github.com/repos/'+repoPath;
    var readyCount = 0;
    var info = {
      'name':'',
      'issues':'',
      'watchers':'',
      'commits':''
    };
    getRepoInfo(repoUrl, function (json) {
      info.name = json.name;
      info.issues = json.open_issues_count;
      info.watchers = json.subscribers_count;
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

  //Adds the repos information to the DOM
  function addRepoInfo() {
    sort();
    var mainUl = document.querySelector('#all-repos-info');
    mainUl.innerHTML = ''; //Clear what is already there before adding anything
    var rankNum = 1; //Rank of the repos depending on sorting preference
    for(var i=0;i<reposInfo.length ;i++) {
      if(reposDisplayOptions[reposInfo[i].name]) { //Only proceed if user wants to see the repo
        var mainUlLi = document.createElement('li');
        mainUlLi.className = 'card';
        mainUl.appendChild(mainUlLi);
        var ulStats = document.createElement('ul');
        ulStats.className = 'stats';
        var repoName = document.createElement('h2');
        repoName.innerHTML = rankNum+'. '+reposInfo[i].name;
        rankNum++;
        ulStats.appendChild(repoName);
        //Only add what user has selected to see
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
  //Sorts the data based on user preference
  function sort() {
    sortBy = sortSelect.value;
    reposInfo.sort(function(a, b) {
      return parseFloat(b[sortBy]) - parseFloat(a[sortBy]);
    });
  }
  //Adds the checkboxes to filter by repository
  function addReposCheckBoxes(repoName) {
    reposDisplayOptions[repoName] = true;
    var repoLi = document.createElement('li');
    var repoLabel = document.createElement('label');
    repoLabel.setAttribute('for',repoName+'-check');
    repoLabel.innerHTML = repoName;
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
    repoLi.appendChild(repoLabel);
    filterRepos.appendChild(repoLi);
  }
  //Gets the basic repository information
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
  //Gets repo statistics
  function getRepoStats(repoUrl, callback) {
    var repoRequest = new Request(repoUrl, requestOptions);
    fetch(repoRequest)
      .then(function(response) {
        if(response.status === 200) {
          response.json().then(function(json) {
            callback(json);
          });
        } else if(response.status === 202) { //Data might not be available yet, tries again after 3 seconds
          window.setTimeout(function () {
            getRepoStats(repoUrl, callback);
          }, 3000);
        }
      });
  }

})();
