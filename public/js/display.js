function SearchTermContainer()   {
    var self = this;

    self.update = function(term) {
        $('#searchTerm').text(term);
    };
}

function BackgroundContainer(id, elementToHold){
    var self = this;
    self.id = id;
    self.container = $(id);
    self.configuredResultCount = 35; /*/ Default /*/

    self.packery = self.container.packery({'itemSelector': elementToHold, 'gutter': 5});

    self.pictures = [];


    self.addImage = function(i)   {
        self.container.append(i.html());
        self.container.packery('addItems', [i.jQueryObject()]);
        self.pictures.push(i);

        self.container.imagesLoaded(function(){
            self.container.packery({'itemSelector': elementToHold, 'gutter': 5});
        });
    };

    self.clearUpSomeOldImages = function(currentTweets, count) {
        if (_.isEmpty(currentTweets._tweets) || count == 0){
            return;
        }

        /*/ Hack to make sure we don't clear when images are too less /*/
        if ($(elementToHold).length + count <= self.configuredResultCount)  {
            console.log("Not clearing images. Configured result count is " + self.configuredResultCount);
            return;
        }
        /*/ End of hack /*/

        var profileImages = _.first(self.pictures, count);
        self.pictures = self.pictures.splice(count);

        _.each(profileImages, function(profileImage){
            if (profileImage.existsInDOM()){
                self.container.packery('remove', profileImage.jQueryObject());
                self.container.packery();
            }
        });
    };

    /* Might be removed */
    self.updatePictureWall = function(tweetObjects, configuredResultCount){

        var sortedTweetObjects = _.sortBy(tweetObjects._tweets, function(tweetObject){
            return tweetObject.processedCount;
        });
        var uniqueTweets = _.uniq(sortedTweetObjects, false, function(t){
            return t.profile_image;
        });

        var grouped = _.groupBy(sortedTweetObjects, function(tweetObject){
            return tweetObject.profile_image;
        });

        var mostTweets = _.uniq(_.sortBy(_.map(_.values(grouped), function(a) {return a.length;})), true);

        var filteredList = _.first(uniqueTweets, configuredResultCount);

        $.each(filteredList, function(i, twit){
            if (mostTweets != null && mostTweets.length > 1 && grouped[twit.profile_image].length == _.last(mostTweets))
                self.addImage(twit.getProfileImage('bigger'));
            else
                self.addImage(twit.getProfileImage('usual'));
        });

        self.configuredResultCount = configuredResultCount;
    };

    self.clear = function() {
        self.container.packery('remove', $(elementToHold));
    };

    /* End */
};

function Tweets(tweetJSON)   {
    var self = this;
    self._tweets = [];
    self._currentProcessingLevel = 0;
    self.maxTweetId = 0;
    self.lastTweetCameInAt  = null;
    self.lastTweetThatCameIn = null;


    self.maxTweetId = function(){
        if (self.lastTweetThatCameIn == null)
        {
            return 0;
        }
        return self.lastTweetThatCameIn.id;
    }

    self.size = function()  {
        return self._tweets.length;
    };

    self.addToTweets = function(tweetCollection){
        if (tweetCollection == null){
            console.log('[FATAL] tweetCollection was null. This should not have happened.');
            return;
        }

        $.each(tweetCollection,
                function (index, tweet) {
                    /*Create Tweet objects */
                    var tweetObject = new Tweet(tweet["id"],
                                          tweet["message"],
                                          tweet["profile_image_uri"],
                                          tweet["profile_image_uri_small"],
                                          tweet["media_uris"],
                                          tweet['user_id'],
                                          tweet['user']
                                        );
                    self._tweets.push(tweetObject);

                    if (self.lastTweetThatCameIn == null  || new Date(tweet["created_at"]) > self.lastTweetCameInAt)
                    {
                        self.lastTweetThatCameIn = tweetObject;
                        self.lastTweetCameInAt = new Date(tweet["created_at"]);
                    }

            });
    };

    self.addToTweets(tweetJSON);

    self.updateWith = function(newTweetObjects) {
        if (newTweetObjects == null) {
            return;
        }
        self.addToTweets(newTweetObjects);
        self._currentProcessingLevel = 0;
    };

    self.getLastTweetId = function()    {
        return Math.max.apply(Math, $.map(self._tweets, function(t, i) {return t.id}));
    };

    self.getATweet = function() {
        if (_.isEmpty(self._tweets))    {
            return console.log("No tweets. What do I get from where?");
        }

        var nextTweet = self.getTweetForCurrentProcessingLevel();

        if (nextTweet == null)   {
            self._currentProcessingLevel = self.getNextProcessingLevelFromExistingTweets();
            nextTweet = self.getTweetForCurrentProcessingLevel();
        }

        nextTweet.process();
        return nextTweet;
    };

    self.getNextProcessingLevelFromExistingTweets = function(){
        var leastProcessedTweet = _.min(self._tweets, function(t){
            return t.processedCount;
        });
        return leastProcessedTweet.processedCount;
    };

    self.getTweetForCurrentProcessingLevel = function (){
        var unprocessedTweet = _.find(self._tweets, function(t){
            return t.processedCount == self._currentProcessingLevel;
        });
        return unprocessedTweet;
    };

    self.noTweetsToSpeakOf = function() {
        return self._tweets == null || _.isEmpty(self._tweets);
    };

    self.shouldRefill = function()  {
        return self._currentProcessingLevel != 0 || self.noTweetsToSpeakOf() ;
    };

};

$(document).ready(function() {
    console.log("Ready");
    fetchTweetsAndDisplay();
});


function fetchTweetsAndDisplay() {
    var self = this;
    var fetcher = new TweetFetcher('/search');
    self.backgroundContainer = new BackgroundContainer("#backgroundContainer", '.profilePicture');
    self.searchTermContainer = new SearchTermContainer();

    var tweets = null;

    fetcher.fetch(function(data, searchTerm, configuredResultCount)    {

        tweets = new Tweets(data);

        self.backgroundContainer.clear();
        self.backgroundContainer.updatePictureWall(tweets, configuredResultCount);
        self.searchTermContainer.update(searchTerm);

        var display = new Display(fetcher, self.backgroundContainer, self.searchTermContainer);

        window.setInterval(function(){
            var tweet = display.nextFrom(tweets);
        }, 10000);

    });
};

function Display(fetcher, backgroundContainer, searchTermContainer) {
    var self = this;
    self.backgroundContainer = backgroundContainer;
    self.searchTermContainer = searchTermContainer;

    var source = $("#tweet-message-template").html();
    var clouds = $("#clouds");

    self.fetcher = fetcher;

    self.template = Handlebars.compile(source);

    self.nextFrom = function(tweetsCollection){
        var tweet = tweetsCollection.getATweet();

        if (tweetsCollection.shouldRefill()){
            self.fetcher.fetchSince(tweetsCollection.maxTweetId(), function(newTweetsAsObjectArray, searchTerm, configuredResultCount){
                /* I hate the flow in this method. Must, must refactor. Alas, no time at present. How I wish! */
                var newTweets = new Tweets(newTweetsAsObjectArray);
                self.backgroundContainer.clearUpSomeOldImages(tweetsCollection, newTweets.size());

                tweetsCollection.updateWith(newTweetsAsObjectArray);
                self.backgroundContainer.updatePictureWall(newTweets, configuredResultCount);
                self.searchTermContainer.update(searchTerm);
            });
        }

        self.show(tweet);
        return tweet;
    };

    self.show = function(tweet){
        clouds.empty();
        var modalTemplate = self.template(tweet);
        clouds.append($(modalTemplate));
    };
}
