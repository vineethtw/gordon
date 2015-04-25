require 'sinatra'
require 'twitter'
require 'json'

configure do
  $twitter = Twitter::REST::Client.new do |config|
    config.consumer_key = ENV['TWITTER_CONSUMER_KEY']
    config.consumer_secret = ENV['TWITTER_CONSUMER_SECRET']
    config.access_token = ENV['TWITTER_ACCESS_TOKEN']
    config.access_token_secret = ENV['TWITTER_ACCESS_TOKEN_SECRET']
  end
  $term = '#vodqa'
  $items = 35
  $username = ENV['XARITA_USERNAME'];
  $password = ENV['XARITA_PASSWORD'];
end


helpers do
  def protected!
    return if authorized?
    headers['WWW-Authenticate'] = 'Basic realm="Restricted Area"'
    halt 401, "Not authorized\n"
  end

  def authorized?
    @auth ||=  Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? and @auth.basic? and @auth.credentials and @auth.credentials == [$username, $password]
  end
end


get '/configure' do
  protected!

  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Request-Method'] = 'GET, OPTIONS, HEAD'
  headers['Access-Control-Allow-Headers'] = 'x-requested-with,Content-Type, Authorization'

  $term =  '#' + params['term']
  $items = params['items'].to_i
end

post '/admin' do
  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Request-Method'] = 'GET, OPTIONS, HEAD'
  headers['Access-Control-Allow-Headers'] = 'x-requested-with,Content-Type, Authorization'

  p params.keys.to_s
  p params.has_key? :username
  p params.has_key? 'username'


  halt 400, 'How do I know, how do I know..?' unless params.has_key? 'username' and params.has_key? 'password'
  halt 400, 'You are forgetting something, kiddo.'  unless params.has_key? 'term' and params.has_key? 'items'
  halt 401, 'Ah ah ah, you did not say the magic word!' unless params['username'].eql? $username and params['password'].eql? $password

  $term = '#'+ params['term']
  $items = params['items'].to_i

end

get '/search' do
  headers['Access-Control-Allow-Origin'] = '*'
  headers['Access-Control-Request-Method'] = 'GET, OPTIONS, HEAD'
  headers['Access-Control-Allow-Headers'] = 'x-requested-with,Content-Type, Authorization'

  content_type :json

  since = params.has_key?('since') ? params['since'] : 0

  tweets = $twitter.search $term, {:result_type => 'recent', :since_id=> since}
  convert(tweets.take($items)).to_json
end


def convert (tweets)
  responseTweets = []
  tweets.each do |tweet|
    responseTweets << {
        'id' => tweet.id.to_s,
        'message' =>  tweet.full_text.gsub(/(http|https):\/\/[\w\.:\/]+/, ''),
        'profile_image_uri' => tweet.user.profile_image_uri(size=:original).to_s,
        'profile_image_uri_small' => tweet.user.profile_image_uri.to_s,
        'media_uris'=> tweet.media? ? tweet.media.collect {|m| m.media_uri.to_s if m.is_a?(Twitter::Media::Photo)}: [],
        'user' => tweet.user.screen_name,
        'user_id'=> tweet.user.id,
        'created_at' => tweet.created_at
    }

  end
  {'tweets' => responseTweets, 'term' => $term, 'items'=> $items}
end
