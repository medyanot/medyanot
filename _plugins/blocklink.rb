module Jekyll
  module Tags
    class BlocklinkTag < Liquid::Block

      def initialize(tag_name, type, tokens)
        super
        type.strip!
          @type = ""
      end

      def render(context)
        site = context.registers[:site]
        converter = site.find_converter_instance(::Jekyll::Converters::Markdown)
        output = converter.convert(super(context))
        "<div class=\"blocklink\">#{output}</div>"
      end
    end
  end
end

Liquid::Template.register_tag('blocklink', Jekyll::Tags::BlocklinkTag)