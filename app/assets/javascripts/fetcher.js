function Tweet(id, message, picture_cell, media_url, user){
    var self = this;
    self.id = id;
    self.message = message;
    self.picture_cell = picture_cell;
    self.media_url = media_url;
    self.user = user;
}

function TweetCollection(raw_tdata) {
    var self = this;

    self._tweets = []
    $.each($.parseJSON(raw_tdata), function(index, tweet){
        self._tweets.push(new Tweet(tweet["id"], tweet["message"], tweet["profile_image_uri"], tweet["media_uris"], tweet['user']));
    });


    self.tweets = function(){
        return self._tweets;
    }

    self.get_displayables = function(){
        var tweet_objects = [];
        $.each(self._tweets, function(index, tweet){
            var tweet_object = new TweetDisplayObject(tweet);
            tweet_objects.push(tweet_object);
        });
        return tweet_objects;
    }

    self.get_random_displayable_tweet = function(){
        var random_index = Math.floor(Math.random() * self._tweets.length);
        return self.get_displayables()[random_index];
    }
}

function TweetContainer(id, selector)    {
    var self = this;

    self._container = $(id);

    self.init = function() {
        $(id).packery({
            itemSelector: selector,
            gutter: 1
        });
    }

    self.append = function(element) {
        element.appendTo(id);
    }

    self.appendToLayout = function (element) {
        self.append(element);
        $(element).hide();
        $(id).imagesLoaded(function () {
            $(element).show();
            $(id).packery('appended', element);
        });
    }
    
    self.init();

}

function GordonDisplayStrategy(container) {
    var self = this;

    this.render = function (tweet) {
        var image = String.format('<img class="picture_cell greyed_out {2}" id="picture_cell_{0}" src="{1}"/>', tweet.id, tweet.picture_cell, self.random_size_style());
        container.appendToLayout($(image));
        self.create_tooltip(tweet, $(image).prop("id"), container);
    }

    self.random_size_style = function () {
        var random_size = Math.floor(Math.random() * 3);
        return new Array('p_small', 'p_medium', 'p_large')[random_size];
    }

    self.create_tooltip = function (tweet, picture_id, container) {
        var tooltip = String.format('<div style="display: none" class="tooltip_popup" id="tooltip_{0}" >{1}</div>', tweet.id, tweet.message);
        container.append($(tooltip));

        $(String.format("#{0}", picture_id)).jBox('Tooltip', {
            content: $(String.format('#tooltip_{0}', tweet.id)),
            animation: 'zoomIn',
            onOpen: function () {
                $(String.format("#{0}", picture_id)).removeClass("greyed_out");
                $(String.format("#{0}", picture_id)).addClass("hovered");
            },
            onClose: function () {
                $(String.format("#{0}", picture_id)).addClass("greyed_out");
                $(String.format("#{0}", picture_id)).removeClass("hovered");
            },
            trigger: 'click'
        });
    }

    this.bringToFront = function(displayableTweet)  {
        $(displayableTweet.identifier()).trigger("click");
    }

    this.close = function(displayableTweet){
      $('img.picture_cell.hovered').trigger('click');
    }

}

function AriesDisplayStrategy(container){
    var self = this;
    self.last_opened_tweet = null;


    this.render = function(tweet) {
        var image = String.format('<img class="picture_cell {2}" id="picture_cell_{0}" src="{1}"/>', tweet.id, tweet.picture_cell, self.random_size_style());
        container.appendToLayout($(image));
    }

    this.bringToFront = function(displayableTweet){
        var html = '<div id="modal_source"><img id="aries_profile_pic" src="{0}"/><div id="tweeter">@{1}</div><div id="aries_tweet">{2}</div></div>';
        container.append($(String.format(html, displayableTweet.profile_pic_url, displayableTweet.user.name, displayableTweet.message)));
        var modal = new jBox("Modal", {
            content: $('#modal_source'),
            overlay: false,
            minWidth: 500,
            maxWidth: 600,
            closeButton: false,
            animation: 'flip',
            addClass: 'tweetModal'
        });
//        $(displayableTweet.identifier()).removeClass('greyed_out');
        modal.open();
        last_opened_tweet = modal;
    }

    this.close = function (displayableTweet){
      last_opened_tweet.close();
      $('#modal_source').remove();
//      $(displayableTweet.identifier()).addClass('greyed_out');

    }

    self.random_size_style = function () {
        var random_size = Math.floor(Math.random() * 3);
        return new Array('p_small', 'p_medium', 'p_large')[random_size];
    }

}

function TweetDisplayObject(tweet){
    var self = this;
    self.user = tweet.user;
    self.message =tweet.message;
    self.profile_pic_url = tweet.picture_cell;


    this.render_using = function(displayStrategy)    {
       displayStrategy.render(tweet)
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

var eventSource = new EventSource("http://localhost:3000/tweets/search");

eventSource.onmessage = function(event) {
    $('#tweet_objects').empty();
    var tweetContainer = new TweetContainer('#tweet_objects', '.picture_cell');
    var tweetCollection = new TweetCollection(event.data)
    var displayStrategy = new AriesDisplayStrategy(tweetContainer);
    $.each(tweetCollection.get_displayables(), function(i, t_d) {t_d.render_using(displayStrategy)});

    eventSource.close();


  var last_displayed_tweet =  tweetCollection.get_random_displayable_tweet()
  last_displayed_tweet.bringToFront(displayStrategy);

  setInterval(function(){
        last_displayed_tweet.close(displayStrategy);
        last_displayed_tweet = tweetCollection.get_random_displayable_tweet();
        last_displayed_tweet.bringToFront(displayStrategy);
    }, 10000);

};
