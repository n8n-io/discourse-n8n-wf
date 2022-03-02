
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

function workflowCode(json) {
  console.log('hello');
  console.log(JSON.stringify(json));
  return `<div class="workflow_preview">
            <n8n-demo workflow='${JSON.stringify(json)}' frame=true ></n8n-demo>
          </div>`
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
  //console.log('checking');
  //console.log(state);
  //console.log(startLine);
  //console.log(endLine);

  if (silent) {
    return true;
  }

  let firstLine = startLine;
  let lastLine = endLine;
  let closed = false;
  var content = null;

  // Check for valid JSON content between first and last lines
  // If we don't find it, gradually bring the last line up
  // If we still don't find it, move the first line down and start again
  while (firstLine < lastLine && content == null) {

    let start = state.bMarks[firstLine] + state.tShift[firstLine]
    let max = state.eMarks[firstLine];
    let markerCode = isBlockStartMarker(state, start, max, state.md);
    lastLine = endLine;

    if(markerCode != null) {
      while (lastLine > firstLine && content == null) {
        // Is the content valid JSON?
        let endContent = state.eMarks[lastLine];
        content = state.src.slice(
          state.bMarks[firstLine] + state.tShift[firstLine],
          endContent
        );

        content = getJSON(content);
        //if(content != null) {
          //break;
        //}

        lastLine--;
      }
    }

    firstLine++;
  }

  // If we got no content then there's no match
  if (content == null) {
    return false;
  }

  // If we had to skip some content before coming to some JSON,
  // include it in the beginning
  if(firstLine != startLine) {
    let skippedContent = state.src.slice(
      state.bMarks[startLine] + state.tShift[startLine],
      state.eMarks[firstLine-2]
    );
    let skippedToken = state.push("inline", "", 0);
    skippedToken.content = skippedContent;
    skippedToken.map      = [ startLine, firstLine-2 ];
    skippedToken.children = [];
    //state.line = firstLine - 1;
    //return true
  }

  // Add the JSON token
  let token = state.push("html_raw", "", 0);

  const escaped = state.md.utils.escapeHtml(JSON.stringify(content, null, 2));
  const preContent = `<pre><code class="hljs json">${escaped}</code></pre>\n`;

  if(isWorkflow(content)) {
    console.log(preContent)
    token.content = workflowCode(content, preContent);
  } else {
    token.content = preContent;
  }
  token.map = [firstLine, lastLine];

  // Move the pointer on
  state.line = lastLine + 2;

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

function extractJSON(str) {
  var firstOpen, firstClose, candidate;
  firstOpen = str.indexOf('{', firstOpen + 1);
  do {
      firstClose = str.lastIndexOf('}');
      console.log('firstOpen: ' + firstOpen, 'firstClose: ' + firstClose);
      if(firstClose <= firstOpen) {
          return null;
      }
      do {
          candidate = str.substring(firstOpen, firstClose + 1);
          console.log('candidate: ' + candidate);
          try {
              var res = JSON.parse(candidate);
              console.log('...found');
              console.log(res);
              return [res, firstOpen, firstClose + 1];
          }
          catch(e) {
              console.log('...failed');
          }
          firstClose = str.substr(0, firstClose).lastIndexOf('}');
      } while(firstClose > firstOpen);
      firstOpen = str.indexOf('{', firstOpen + 1);
  } while(firstOpen != -1);
}

export function setup(helper) {
  if (!helper.markdownIt) return;

  // Need to work around Discourse's sanitizer. With the settings below it allows onclick and onload, but they don't seem
  // to be executed for some reason (at least in the preview window)
  // https://github.com/discourse/discourse/blob/148ee1d1627cda7d65a028bf43f548e1b3efed6a/app/assets/javascripts/pretty-text/addon/allow-lister.js
  //helper.allowList(['div.embedded_workflow', 'div.embedded_tip', 'div.wrapper', 'div[style]', 'a[onclick]', 'iframe[onload]', 'iframe[style]', 'div.btn', 'code.hljs', 'code.json']);
  //helper.allowList(['div.embedded_workflow', 'div.embedded_tip']);

  helper.registerPlugin((md) => {

    defaultFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
				return self.renderToken(tokens, idx, options, env, self);
    };

    // This adds a new rule for JSON blocks, to detect them even when they're not fenced
    // It doesn't seem to be rendering properly on the backend (once you cook the past on publishing it)
    // It also messes up the rendering of all the other markdown on the page
    md.block.ruler.after("code", "json", blockJSON);
    // Investigate this:
    // https://github.com/markdown-it/markdown-it/blob/master/lib/parser_block.js
    //console.log(md.block.ruler.getRules(''));

    // This way will render fenced JSON using isWorkflow(), but is subject to Discourse's sanitizer
    // onlaod and onclick attributes are loaded after being whitelisted above. but they don't seem to actually be executed
    // It doesn't seem to be rendering properly on the backend (once you cook the past on publishing it)
    // md.renderer.rules.fence = fenceRenderer;

    // If you comment out the first one and only have the second one, the post doesn't cook properly
  });

}
