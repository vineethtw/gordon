  class Tweets
    def recent_tweets(hashtag, number_of_results=100)
      tweets = []
      $twitter.search(hashtag, result_type: "recent").take(number_of_results).each do |tweet|

        tweets << {
            'id' => tweet.id,
            'message' => tweet.full_text,
            'profile_image_uri' => tweet.user.profile_image_uri(size=:original).to_s,
            'media_uris'=> tweet.media? ? tweet.media.collect {|m| m.media_uri.to_s if m.is_a?(Twitter::Media::Photo)}: []
        }
      end
      tweets
    end
  end

