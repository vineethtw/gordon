require 'json'

class TweetsController < ApplicationController
  include ActionController::Live

  def search
    tweets = ::Tweets.new
    response.headers['Content-Type'] = 'text/event-stream'
    begin
      loop do
        recent_tweets =  tweets.recent_tweets('vodqa', number_of_results = 30)
        response.stream.write("data: %s \n\n" % (recent_tweets.to_json))
        sleep 10
      end

    rescue IOError
        # do nothing
    ensure
      response.close
    end


  end
end
