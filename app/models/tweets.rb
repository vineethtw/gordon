  class Tweets
    def recent_tweets(hashtag, number_of_results=100)
      tweets = []
      $twitter.search(hashtag, result_type: "recent").take(number_of_results).each do |tweet|
        tweets << {
            'message' => tweet.full_text
        }
      end
      tweets
    end
  end

