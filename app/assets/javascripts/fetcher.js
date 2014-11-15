function Tweet(message, profile_pic, media_url){
    var self = this;
    self.message = message;
    self.profile_pic = profile_pic;
    self.media_url = media_url;
}

function convert_to_objects(tweet_data){
    var tweets_on_screen = [];
    $.each($.parseJSON(tweet_data), function(index, tweet){
        tweets_on_screen.push(new Tweet(tweet["message"],tweet["profile_image_uri"],tweet["media_uris"]));
    });
    return tweets_on_screen;
}

function TweetDisplayObject(tweet){
    this.as_html = function(){
        var html = String.format(
            '<div>' +
                '<span>' +
                    '<img id="profile_pic" src="{0}"/>' +
                '</span>' +
                '<span>' +
                    '<div id="tweet_message">{1}</div>' +
                '</span>' +
            '</div>', tweet.profile_pic, tweet.message);
        $(html).appendTo($('#tweet_objects'));
    }
}

var eventSource = new EventSource("http://localhost:3000/tweets/search");

eventSource.onmessage = function(event) {
    $("#tweet_container").html(event.data);

    var tweets = convert_to_objects(event.data);
    new TweetDisplayObject(tweets[0]).as_html();




};
