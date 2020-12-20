module Jekyll
  module Tags
    class NoticeTag < Liquid::Block

      def initialize(tag_name, type, tokens)
        super
        type.strip!
        if %w(notice-left notice-right).include?(type)
          @type = type
        else
          @type = ""
        end
      end

      def render(context)
        site = context.registers[:site]
        converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
        output = converter.convert(super(context))
        "<aside class=\"notice #{@type}\">#{output}</aside>"
      end
    end
  end
end

Liquid::Template.register_tag('notice', Jekyll::Tags::NoticeTag)