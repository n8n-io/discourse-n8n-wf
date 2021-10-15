
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

  let encoded = encodeURI(JSON.stringify(json));
  let escaped = JSON.stringify(json).replaceAll('"', '\\"');
  console.log(escaped);

  return '<div class="embedded_workflow">' +
           `<img src="" data-workflow="${encoded}"></img>` +
           `<div class="embedded_tip">💡 Try out this workflow! <a href="#" onclick="navigator.clipboard.writeText(decodeURI('${encoded}'));return false">Copy</a> and paste its code into n8n</div>` +
           `<div class="wrapper">` +
             `<div class="btn" onclick="navigator.clipboard.writeText(decodeURI('${encoded}'))">Copy</div>` +
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

  let nextLine = endLine+1;
  let closed = false;
  var content;
  for (;;) {
    nextLine--;

    // If we get to the start line then we consider it as no match
    if (nextLine <= startLine) {
      return false;
    }

    // Is the content valid JSON?
    let endContent = state.eMarks[nextLine];
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

  state.line = nextLine + 1;

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

