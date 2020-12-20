module Jekyll
  module Tags
    class QuoteTag < Liquid::Block

      def initialize(tag_name, type, tokens)
        super
        type.strip!
        if %w(quoteleft quoteright).include?(type)
          @type = type
        else
          @type = ""
        end
      end

      def render(context)
        site = context.registers[:site]
        converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
        output = converter.convert(super(context))
        "<aside aria-hidden='true' class=\"quote #{@type}\">#{output}</aside>"
      end
    end
  end
end

Liquid::Template.register_tag('quote', Jekyll::Tags::QuoteTag)