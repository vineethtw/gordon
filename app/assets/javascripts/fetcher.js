function Tweet(id, message, picture_cell, media_url){
    var self = this;
    self.id = id;
    self.message = message;
    self.picture_cell = picture_cell;
    self.media_url = media_url;
}

function TweetCollection(raw_tdata) {
    var self = this;

    self._tweets = []
    $.each($.parseJSON(raw_tdata), function(index, tweet){
        self._tweets.push(new Tweet(tweet["id"], tweet["message"], tweet["profile_image_uri"], tweet["media_uris"]));
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

function Container(id)    {
    var self = this;

    self._container = $(id);

    self.append = function(elements) {
        $.each(elements, function(i, element){
           element.appendTo(id);
        });
    }
}


function TweetDisplayObject(tweet){
    var self = this;

    this.render_to = function(container)    {
        var image = String.format('<img class="picture_cell greyed_out {2}" id="picture_cell_{0}" src="{1}"/>', tweet.id, tweet.picture_cell, self.random_size_style());
        $(image).appendTo(container);
        self.create_tooltip(tweet, $(image).prop("id"), container);
    }

    self.create_tooltip = function(tweet, picture_id, container)  {
        var tooltip = String.format('<div style="display: none" class="tooltip_popup" id="tooltip_{0}" >{1}</div>', tweet.id, tweet.message);
        $(tooltip).appendTo(container);

        $(String.format("#{0}", picture_id)).jBox('Tooltip',{
            content: $(String.format('#tooltip_{0}', tweet.id)),
            animation: 'zoomIn',
            onOpen: function(){
                $(String.format("#{0}", picture_id)).removeClass("greyed_out");
                $(String.format("#{0}", picture_id)).addClass("hovered");
            },
            onClose: function(){
                $(String.format("#{0}", picture_id)).addClass("greyed_out");
                $(String.format("#{0}", picture_id)).removeClass("hovered");
            },
            trigger: 'click'
        });
    }

    self.random_size_style = function() {
        var random_size = Math.floor(Math.random() * 3);
        return new Array('p_small', 'p_medium', 'p_large')[random_size];
    }

    this.as_html = function(){
        var image = String.format('<img class="picture_cell greyed_out" id="picture_cell_{0}" src="{1}"/>', tweet.id, tweet.picture_cell);
        var tooltip = String.format('<div style="display: none" class="tooltip_popup" id="{0}" >{1}</div>', tweet.id, tweet.message);

        var random_size = Math.floor(Math.random() * 3);
        $(image).addClass(new Array('p_small', 'p_medium', 'p_large')[random_size]).appendTo('#tweet_objects');
        if (Math.random() * 2 > 1){
            $(image).addClass('p_micro').appendTo('#tweet_objects');
        }

        $(tooltip).appendTo($('#tweet_objects'));

        $(String.format("#picture_cell_{0}", tweet.id)).jBox('Tooltip',{
            content: $(String.format('#{0}', tweet.id)),
            animation: 'zoomIn',
            onOpen: function(){
                $(String.format("#picture_cell_{0}", tweet.id)).removeClass("greyed_out");
                $(String.format("#picture_cell_{0}", tweet.id)).addClass("hovered");
            },
            onClose: function(){
                $(String.format("#picture_cell_{0}", tweet.id)).addClass("greyed_out");
                $(String.format("#picture_cell_{0}", tweet.id)).removeClass("hovered");
            },
            trigger: 'click'
        });
    };

    this.identifier = function(){
        return String.format("#picture_cell_{0}", tweet.id);
    }
}

var eventSource = new EventSource("http://localhost:3000/tweets/search");

eventSource.onmessage = function(event) {
    $('#tweet_objects').empty();
    var tweetCollection = new TweetCollection(event.data)
    $.each(tweetCollection.get_displayables(), function(i, t_d) {t_d.render_to('#tweet_objects')});

    eventSource.close();


    setInterval(function(){
        $('img.picture_cell.hovered').trigger('click');
        $(tweetCollection.get_random_displayable_tweet().identifier()).trigger('click');
    }, 8000);

    var container = document.querySelector('#tweet_objects');
    imagesLoaded(container, function(){
        new Packery(container, {
            itemSelector: '.picture_cell',
            gutter: 2
        });
    });




};
