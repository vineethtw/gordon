var eventSource = new EventSource("http://localhost:3000/tweets/search");

eventSource.onmessage = function(event) {
    $("#tweet_container").html(event.data);
};
