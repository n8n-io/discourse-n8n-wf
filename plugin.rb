# name: n8n-workflow-renderer
# about: Pretty rendering of n8n workflow code
# version: 0.0.1
# authors: David Roberts (n8n)

register_asset "stylesheets/n8n-wf.css"
register_asset "javascripts/discourse/initializers/discourse-n8n-wf.js.es6"
register_asset "javascripts/load_iframe.js"

register_svg_icon "network-wired" if respond_to?(:register_svg_icon)
