function Tweet(id, message, profile_pic, media_url){
    var self = this;
    self.id = id;
    self.message = message;
    self.profile_pic = profile_pic;
    self.media_url = media_url;
}

function convert_to_objects(tweet_data){
    var tweets_on_screen = [];
    $.each($.parseJSON(tweet_data), function(index, tweet){
        tweets_on_screen.push(new Tweet(tweet["id"], tweet["message"], tweet["profile_image_uri"], tweet["media_uris"]));
    });
    return tweets_on_screen;
}

function TweetDisplayObject(tweet){
    this.as_html = function(){
        var image = String.format('<img class="profile_pic greyed_out" id="profile_pic_{0}" src="{1}"/>', tweet.id, tweet.profile_pic);
        var tooltip = String.format('<div style="display: none" class="tooltip_popup" id="{0}" >{1}</div>', tweet.id, tweet.message);

        $(image).appendTo($('#tweet_objects'));
        $(tooltip).appendTo($('#tweet_objects'));

        $(String.format("#profile_pic_{0}", tweet.id)).jBox('Tooltip',{
            content: $(String.format('#{0}', tweet.id)),
            animation: 'flip',
            onOpen: function(){
                $(String.format("#profile_pic_{0}", tweet.id)).removeClass("greyed_out");
                $(String.format("#profile_pic_{0}", tweet.id)).addClass("hovered");

            },
            onClose: function(){
                $(String.format("#profile_pic_{0}", tweet.id)).addClass("greyed_out");
                $(String.format("#profile_pic_{0}", tweet.id)).removeClass("hovered");
            }
        });
    }
}

var eventSource = new EventSource("http://localhost:3000/tweets/search");

eventSource.onmessage = function(event) {
    $('#tweet_objects').empty();
    var tweets = convert_to_objects(event.data);
    $.each(tweets, function(index, tweet){
        new TweetDisplayObject(tweet).as_html();
    });

    eventSource.close();



};
