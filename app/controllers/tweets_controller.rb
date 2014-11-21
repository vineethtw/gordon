require 'json'

class TweetsController < ApplicationController
  include ActionController::Live

  def search
    tweets = ::Tweets.new
    response.headers['Content-Type'] = 'text/event-stream'
    search_term = params[:term].blank? ? "xconf": params[:term]
    count = params[:count].blank? ? 20 : params[:count].to_i
    refresh = params[:refresh].blank? ? 30 : params[:refresh].to_i;
    begin
      loop do
        recent_tweets =  tweets.recent_tweets(search_term, number_of_results = count)
        response.stream.write("data: %s \n\n" % (recent_tweets.to_json))
        sleep refresh
      end

    rescue IOError
        # do nothing
    ensure
      response.close
    end


  end
end
