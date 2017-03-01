# Github Dashboard
The Github Dashboard keeps track of the open issues, watchers, 
and commits from the past year for 4 repositories. In order to keep track 
of more repositories, you can simply add the Github path to the 
repositories array in site.js.

The reason I decided to keep track of those three stats is because I believe
they are key information about the status and standing of the repositories. 

## Features
With the Github dashboard, you can sort the repositories based on the amount 
of open issues, watchers, and commits. 

You may also filter the information displayed
to any combination of those statistics. 

Lastly, you can hide and show repositories in order to better compare their
statistics.

## Implementation
First, I wanted to keep track of the information the user wants to see so I added
a JSON object to keep track of the flags for each stat and repository. I also wanted
the user to be able to sort the repositories so I keep track of what the user has chosen 
to sort by (open issues is default).

I knew I wanted to query the repository information first from Github's API and then,
once retrieved, to be able to display it. In order to not let the site hang meanwhile
the information is being retrieved, I make calls to Github asynchronously. I use a 
function callback to know when to display the information.

I keep event listeners for each of the options available to the user. Every time 
each of the options is changed, the interface refreshes based on the user preference.
However, any change made does not make another call to Github for the repositories' 
information. Instead, it simply refreshes the interface with a copy of the latest
repository information. The information is only retrieved at a set interval specified 
in the site.js file.

Upon reading the documentation of Github's API, it is mentioned that making a call
to obtain the repositories stats may return a status 202. This means that the 
request was accepted and the information for the repository in being compiled in
the background. I handle this by setting a timer of 3 seconds before calling
the api once again.

Lastly, everything is done in vanilla JavaScript.

## UI
I am personally a fan of Google's Material Design and their card UI. To display
the repositories' information, I decided to have each repository and their stats 
in a card of their own.

The cards also have a number signifying the rank of the repository based on the 
sorting preference.

Ultimately, this makes up to a simple UI that is also responsive. I started out
making the dashboard with a smart phone screen in mind. This means that even if
the dashboard is viewed on a mobile phone, the user interface manages to look 
presentable.

When the screen is bigger, for example on the desktop, the cards are displayed in 
two columns in the center of the screen. I place padding on the sides so the cards
don't take the full width of the display, instead, they take a certain width based
on the size of the display.

##Conclusion
I had a lot of fun making this dashboard. It was a great learning experience to be 
able to use vanilla JavaScript to achieve the end result. It was a personal goal since
the beginning to make it as scalable as possible. That is why it is very easy to keep
track of other repositories by simply adding their Github path in the JS file.
Not only that, but it is also easy to keep track of other stats. 
