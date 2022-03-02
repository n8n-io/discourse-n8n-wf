# name: n8n-workflow-renderer
# about: previews workflow code
# version: 0.1.0
# authors: David Roberts (n8n), Anuj Kapoor (n8n)

register_asset "stylesheets/n8n-wf.css"
register_asset "javascripts/discourse/initializers/discourse-n8n-wf.js.es6"

register_svg_icon "network-wired" if respond_to?(:register_svg_icon)
