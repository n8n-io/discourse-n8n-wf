let defaultFenceRenderer = null;
let defaultHTMLRenderer = null;

function getJSON(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch(e) {
    return null;
  }
  return parsed;
}

function isWorkflow(json) {
  return json && json['nodes'] && Array.isArray(json['nodes']) && json['nodes'][0]['type'];
}

function workflowCode(json) {
  return `<div class="workflow_preview">
            <n8n-demo workflow='${JSON.stringify(json)}' frame=true ></n8n-demo>
          </div>`
}

function fenceRenderer(tokens, idx, options, env, self) {
  let content = tokens[idx].content;
  let json = getJSON(content);

  if(isWorkflow(json)) {
    tokens[idx].content = workflowCode(json);
    tokens[idx].type = "html_block";
    tokens[idx].markup = "";
    tokens[idx].tag = "";
    return defaultHTMLRenderer(tokens, idx, options, env, self);
  }
  return defaultFenceRenderer(tokens, idx, options, env, self);
};

export function setup(helper) {
  if (!helper.markdownIt) return;
  helper.allowList(['div.embedded_workflow', 'div.embedded_tip']);
  helper.registerPlugin((md) => {
    defaultFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
      return self.renderInline(tokens, idx, options, env, self);
    };
    defaultHTMLRenderer = md.renderer.rules.html_raw || function(tokens, idx, options, env, self) {
				return self.renderInline(tokens, idx, options, env, self);
    };
    // md.block.ruler.after("code", "json", blockJSON);
    md.renderer.rules.fence = fenceRenderer;
  });
}
