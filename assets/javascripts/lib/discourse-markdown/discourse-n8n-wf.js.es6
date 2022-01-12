
// TODO: When putting a workflow inside a fence (```), it's rendered properly in the
// preview, but not in the cooked post

let defaultFenceRenderer = null;

function getJSON(content) {
  //console.log('testing ' + content);
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch(e) {
    return null;
  }

  //console.log('Valid!');
  return parsed;
}

function isWorkflow(json) {
  return json && json['nodes'] && Array.isArray(json['nodes']) && json['nodes'][0]['type'];
}

function workflowCode(json, preContent) {

  let encoded = encodeURIComponent(JSON.stringify(json)).replaceAll("'", '%27');

  return '<div class="embedded_workflow">' +
           //`<iframe src="https://n8n-test3.herokuapp.com/workflow" id="int_iframe" style="width:100%;border:0;display:block" onload="prepareWorkflow(decodeURI('${encoded}'))"></iframe>` +
           `<iframe src="https://n8n-test3.herokuapp.com/workflow?workflow=${encoded}" id="int_iframe" width="100%" height="300" style="width:100%;border:0;display:block" onload="prepareWorkflow(this)"></iframe>` +
           //`<div style="position:relative" onmouseover="document.getElementById('int_btn').style.setProperty('display', 'block', 'important');" onmouseout="document.getElementById('int_btn').style.setProperty('display', 'none', 'important');">` +
             //`<img src="" data-workflow="${encoded}"></img>` +
             //`<img src="/plugins/n8n-workflow-renderer/images/dummy_workflow.png" id="screenshot"></img>` +
             //`<div style="position:absolute;top:0;left:0;bottom:0;right:0;margin:auto">` +
             //`<div id="int_btn" class="btn" ` +
                //`style="display:none !important;position:absolute !important;top:50% !important;left:50%;transform:translate(-50%,-50%)" ` +
                //`onclick="` +
                    //`loadWorkflow(decodeURI('${encoded}'));` +
                    //`document.getElementById('int_iframe').style.setProperty('display', 'block', 'important');` +
                    //`document.getElementById('screenshot').style.setProperty('display', 'none', 'important');` +
                //`">` +
               ////`<div style="min-height: 100px;display: inline-flex;align-items: center;border: 1px solid aqua;">Yeah</div>` +
                //`<svg class="fa d-icon d-icon-cog svg-icon svg-string" />` +
                //`Interactive version` +
             //`</div>` +
           //`</div>` +
           `<div class="embedded_tip">💡 Double-click a node to see its settings, and paste the <a href="#" onclick="toggleCodeVisibility(this);return false">workflow code</a> into n8n to import it</div>` +
           `<div class="wrapper" id="code" style="display:none">` +
             `<div class="btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${encoded}'))">Copy</div>` +
             preContent +
           '</div>' +
         '</div>'

}

function isBlockStartMarker(state, start, max, md) {
  let startMarkers = [91, 123]; // [ and {
  let markerCode = null

  if (startMarkers.includes(state.src.charCodeAt(start))) {
    markerCode = state.src.charCodeAt(start);
  } else {
    return null;
  }

  start++;

  // ensure we only have newlines after our [ or {
  for (let i = start; i < max; i++) {
    if (!md.utils.isSpace(state.src.charCodeAt(i))) {
      return null;
    }
  }

  return markerCode;
}

function blockJSON(state, startLine, endLine, silent) {
  let start = state.bMarks[startLine] + state.tShift[startLine],
    max = state.eMarks[startLine];

  let markerCode = isBlockStartMarker(state, start, max, state.md);
  if(markerCode == null) return false;

  if (silent) {
    return true;
  }

  let lastLine = endLine+1;
  let closed = false;
  var content;
  for (;;) {
    lastLine--;

    // If we get to the start line then we consider it as no match
    if (lastLine <= startLine) {
      return false;
    }

    // Is the content valid JSON?
    let endContent = state.eMarks[lastLine];
    content = state.src.slice(
      state.bMarks[startLine] + state.tShift[startLine],
      endContent
    );

    content = getJSON(content);
    if(content != null) {
      break;
    }
  }

  let token = state.push("html_raw", "", 0);

  const escaped = state.md.utils.escapeHtml(JSON.stringify(content, null, 2));
  const preContent = `<pre><code class="hljs json">${escaped}</code></pre>\n`;

  if(isWorkflow(content)) {
    token.content = workflowCode(content, preContent);
  } else {
    token.content = preContent;
  }

  state.line = lastLine + 1;

  return true;
}

function fenceRenderer(tokens, idx, options, env, slf) {

  let content = tokens[idx].content;
  let json = getJSON(content);

  if(isWorkflow(json)) {
    return workflowCode(json, defaultFenceRenderer(tokens, idx, options, env, self));
  }

  return defaultFenceRenderer(tokens, idx, options, env, self);

};

export function setup(helper) {
  if (!helper.markdownIt) return;

  helper.allowList(['div.embedded_workflow', 'div.embedded_tip']);

  helper.registerPlugin((md) => {

    defaultFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
				return self.renderToken(tokens, idx, options, env, self);
    };

    md.block.ruler.after("code", "json", blockJSON);
    md.renderer.rules.fence = fenceRenderer;
  });

}

