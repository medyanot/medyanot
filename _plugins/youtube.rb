module Jekyll
  class ResponsiveYouTubeTag < Liquid::Tag
    def initialize(tag_name, markup, options)
      super
      @video_id = markup.strip
    end

    def render(context)
      %Q[
<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item" width="560" height="315" src="https://www.youtube.com/embed/#{@video_id}" frameborder="0" allowfullscreen>
  </iframe>
</div>
      ]
    end
  end
end

Liquid::Template.register_tag("youtube", Jekyll::ResponsiveYouTubeTag)