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

