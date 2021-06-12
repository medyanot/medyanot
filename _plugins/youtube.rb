module Jekyll
  class ResponsiveYouTubeTag < Liquid::Tag
    def initialize(tag_name, markup, options)
      super
      @video_id = markup.strip
    end

    def render(context)
      %Q[
<div class="ratio-box" style="padding-bottom: 56.2897078%">
<div class="embed-responsive embed-responsive-16by9">
  <iframe class="lazyload" class="embed-responsive-item" width="787" height="443" data-src="https://www.youtube.com/embed/#{@video_id}" frameborder="0" allowfullscreen>
  </iframe>
</div>
</div>
      ]
    end
  end
end

Liquid::Template.register_tag("youtube", Jekyll::ResponsiveYouTubeTag)