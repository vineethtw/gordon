function TweetContainer(id, selector)    {
    var self = this;

    self._container = $(id);

    self.init = function() {
        $(id).packery({
            itemSelector: selector,
            gutter: 1
        });
    }

    self.identifer = function() {
        return id;
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

    self.removeFromLayout = function(element){
        $(id).packery('remove', element);
    }

    self.cleanUp = function(number){
        var dirtyElements = $('.dirty');
        var deleted = dirtyElements.length<=number?dirtyElements.length-1: number-1;
        $.each($('.dirty').slice(0, deleted), function(i, e){self.removeFromLayout(e);})
        self.init();
        return deleted + 1;
    }

    self.init();

}