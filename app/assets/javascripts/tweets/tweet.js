function Tweet(id, message, picture_cell, media_url, user){
    var self = this;
    self.id = id;
    self.message = message;
    self.picture_cell = picture_cell;
    self.media_url = null;

    if (media_url !=null && media_url.length>=1){
        self.media_url = media_url[0];
    }
    self.user = user;
}


