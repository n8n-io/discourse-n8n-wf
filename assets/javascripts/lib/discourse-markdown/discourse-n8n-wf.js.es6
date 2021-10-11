export function setup(helper) {
  if (!helper.markdownIt) return;

  //helper.registerOptions((opts, siteSettings) => {
    //opts.features.math = siteSettings.discourse_math_enabled;
    //opts.features.asciimath = siteSettings.discourse_math_enable_asciimath;
  //});

  helper.allowList(['div.embedded_workflow', 'div.embedded_tip']);

  helper.registerPlugin((md) => {
    //if (md.options.discourse.features.math) {
      //if (md.options.discourse.features.asciimath) {
        //md.inline.ruler.after("escape", "asciimath", asciiMath);
      //}
      //md.inline.ruler.after("escape", "math", inlineMath);
      //md.block.ruler.after("code", "math", blockMath, {
        //alt: ["paragraph", "reference", "blockquote", "list"],
      //});
    //}

    md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
      let content = tokens[idx].content;
      return '<div class="embedded_workflow">' +
               '<div class="embedded_tip">Copy and paste this code into n8n to play with the workflow</div>' +
               tokens[idx].content +
             '</div>'
    };

    // Remember old renderer, if overridden, or proxy to default renderer
    //var defaultRender = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
      //return self.renderToken(tokens, idx, options);
    //};

    //md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
      //let content = tokens[idx].content;
      //return '<div class="embedded_workflow">' +
               //'<div class="embedded_tip">Copy and paste this code into n8n to play with the workflow</div>' +
               //defaultRender(tokens, idx, options, env, self) +
             //'</div>'
    //};
    
  });

}

