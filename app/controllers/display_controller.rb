class DisplayController < ApplicationController
  def index
    @search_term = params[:term].blank? ? "xconf": params[:term]
    @result_count = params[:count].blank? ? 40 : params[:count].to_i
    @refresh_rate = params[:refresh].blank? ? 30: params[:refresh].to_i
    @wait = params[:wait].blank? ? 10000: params[:wait].to_i

  end
end
