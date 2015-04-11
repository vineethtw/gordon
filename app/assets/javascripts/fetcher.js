








function TweetDisplayObject(tweet){
    var self = this;
    self.user = tweet.user;
    self.message =tweet.message;
    self.profile_pic_url = tweet.picture_cell;
    self.id =tweet.id;
    self.photo = tweet.media_url;

    self.isDirty = false;

    this.render_using = function(displayStrategy)    {
       displayStrategy.render(self);
    }

    self.markDirty = function() {
        $(self.identifier()).addClass('dirty');
    }

    this.identifier = function(){
        return String.format("#picture_cell_{0}", tweet.id);
    }

    this.bringToFront = function(displayStrategy)  {
        displayStrategy.bringToFront(self);
    }

    this.close = function(displayStrategy)  {
      displayStrategy.close(self)
    }
}



$(document).ready( function() {

    var tweetContainer = new TweetContainer('#tweet_objects', '.picture_cell');
    var tweetCollection = new TweetCollection()
    var displayStrategy = new AriesDisplayStrategy(tweetContainer);
    var eventSource = new EventSource(String.format("/tweets/search?term={0}&count={1}&refresh={2}",$('#search').data('term'), $('#search').data('count'), $('#search').data('refresh')));
    var lastDisplayedTweet = null;
    var firstRun = true;

    setInterval(function () {
        if (tweetCollection.isNotEmpty()) {
            if (lastDisplayedTweet!=null) {
                lastDisplayedTweet.close(displayStrategy);
            }
            lastDisplayedTweet = tweetCollection.get_random_displayable_tweet();
            lastDisplayedTweet.bringToFront(displayStrategy);
        }
        else{
            if (lastDisplayedTweet !=null){
                lastDisplayedTweet.close(displayStrategy);
            }
        }
    }, parseInt($('#search').data('wait')));

    eventSource.onmessage = function(event) {
        var new_tweets = new TweetCollection();
        new_tweets.add_from(event.data);
        tweetCollection.merge(new_tweets);
        var removed_last = tweetContainer.cleanUp(new_tweets.length());

        var displayables = null;
        if (firstRun==true){
            displayables = new_tweets.get_displayables($('#search').data('count'));
            firstRun = false;
        }
        else {
            displayables = new_tweets.get_displayables().slice(0, removed_last-1).slice(0, parseInt($('#search').data('count'))- 1);
        }

        $.each(displayables, function (i, t_d) {
            t_d.render_using(displayStrategy)
        });
        //eventSource.close();
    }

});







