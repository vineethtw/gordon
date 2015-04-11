function TweetCollection() {
    var self = this;
    self._tweets = [];

    self.add_from = function(raw_tdata) {
        $.each($.parseJSON(raw_tdata), function (index, tweet) {
            self._tweets.push(new Tweet(tweet["id"], tweet["message"], tweet["profile_image_uri"], tweet["media_uris"], tweet['user']));
        });
    }

    self.merge = function(collection)   {
        $.each(collection._tweets, function(i, t){self._tweets.push(t);});
    }


    self.tweets = function(){
        return self._tweets;
    }

    self.get_displayables = function(min_length){
        var tweet_objects = [];
        $.each(self._tweets, function(index, tweet){
            var tweet_object = new TweetDisplayObject(tweet);
            tweet_objects.push(tweet_object);
        });
        if (min_length != null) {
            var current_length = tweet_objects.length;
            for(var i= current_length; i < min_length; i++)    {
                var filler_tweet = new TweetDisplayObject(self.get_random_tweet());
                filler_tweet.isDirty = true;
                tweet_objects.push(filler_tweet);
            }
        }

        return tweet_objects;
    }

    self.get_random_displayable_tweet = function(){
        var random_index = Math.floor(Math.random() * self._tweets.length);
        var to_return = self.get_displayables()[random_index];
        self._tweets.splice(random_index, 1);
        return to_return;
    }

    self.get_random_tweet = function(){
        var random_index = Math.floor(Math.random() * self._tweets.length);
        return self._tweets[random_index];
    }

    self.isNotEmpty = function() {
        return self._tweets.length != 0;
    }

    self.length = function()    {
        return self._tweets.length;
    }

}