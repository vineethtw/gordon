class DisplayController < ApplicationController
  def index
    @search_term = params[:term].blank? ? "xconf": params[:term]
    @result_count = params[:count].blank? ? 40 : params[:count].to_i;
  end
end
