function AriesDisplayStrategy(container){
    var self = this;
    self.last_opened_tweet = null;


    this.render = function(tweet, shouldCleanUp) {
        var image = String.format('<img class="picture_cell {2} {3}" id="picture_cell_{0}" src="{1}"/>', tweet.id, tweet.profile_pic_url, self.random_size_style(), tweet.isDirty? "dirty": "");
        container.appendToLayout($(image));
        if (tweet.photo != null)    {
            var picture = String.format('<img class="picture_cell dirty aries_container_photo" src="{0}"/>', tweet.photo);
            container.appendToLayout($(picture));
        }
    }

    this.bringToFront = function(displayableTweet){
        if (displayableTweet.photo == null){
            var html = '<div id="modal_source"><img id="aries_profile_pic" src="{0}"/><div id="tweeter">@{1}</div><div id="aries_tweet">{2}</div></div>';
            container.append($(String.format(html, displayableTweet.profile_pic_url, displayableTweet.user.screen_name, displayableTweet.message)));
        }
        else{
            var html = '<div id="modal_source"><img id="aries_profile_pic" src="{0}"/><div id="tweeter">@{1}</div><div id="aries_tweet">{2}</div><img class="aries_photo" src="{3}"/></div>';
            container.append($(String.format(html, displayableTweet.profile_pic_url, displayableTweet.user.screen_name, displayableTweet.message, displayableTweet.photo)));
        }

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
        $(container.identifer()).imagesLoaded(function(){
            modal.open();
        });
        last_opened_tweet = modal;
    }

    this.close = function (displayableTweet){
        last_opened_tweet.close();
        $('#modal_source').remove();
        displayableTweet.markDirty();
//      $(displayableTweet.identifier()).addClass('greyed_out');
    }

    self.random_size_style = function () {
        var random_size = Math.floor(Math.random() * 3);
        return new Array('p_small', 'p_medium', 'p_large')[random_size];
    }

}