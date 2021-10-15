// NB: For this to work, you need to enable CORS in Discourse
// https://meta.discourse.org/t/what-are-the-risks-of-enabling-cross-origin-resource-sharing-discourse-enable-cors/41248?u=sirdavidoff

import { withPluginApi } from 'discourse/lib/plugin-api';
import { h } from "virtual-dom";
import attributeHook from "discourse-common/lib/attribute-hook";
import Composer from "discourse/components/d-editor";
import showModal from "discourse/lib/show-modal";

//let endpoint = "https://davidn8n.app.n8n.cloud/webhook/780548fe-da8e-4092-8948-ebd5cd782946"
let urlStart = "https://n8n-screenshotter.herokuapp.com"
let endpoint = urlStart + "/capture"

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function iconClasses(icon, params) {
  // "notification." is invalid syntax for classes, use replacement instead
  const dClass =
    icon.replacementId && icon.id.indexOf("notification.") > -1
      ? icon.replacementId
      : icon.id;

  let classNames = `fa d-icon d-icon-${dClass} svg-icon`;

  if (params && params["class"]) {
    classNames += " " + params["class"];
  }

  return classNames;
}

function handleIconId(icon) {
  let id = icon.replacementId || icon.id || "";

  // TODO: clean up "thumbtack unpinned" at source instead of here
  id = id.replace(" unpinned", "");

  return id;
}

export default {
  name: 'alert',
  initialize() {
    withPluginApi('0.12', api => {       

      api.registerIconRenderer({
        name: 'n8n-renderer',
     
        // for the place in code that render a string
        string(icon, params) {
          const id = escape(handleIconId(icon));
          if(icon.id == 'network-wired') {
            return `<svg class="${iconClasses(icon, params)} svg-string" aria-hidden="true"><use xlink:href="#${id}"></use></svg>&nbsp;Workflow`;
          }
          return `<svg class="${iconClasses(icon, params)} svg-string" aria-hidden="true"><use xlink:href="#${id}"></use></svg>`;
        },

        // Lifted straight from
        // https://github.com/discourse/discourse/blob/main/app/assets/javascripts/discourse-common/addon/lib/icon-library.js
        node(icon, params) {
          const id = handleIconId(icon);
          const classes = iconClasses(icon, params) + " svg-node";

          const svg = h(
            "svg",
            {
              attributes: { class: classes, "aria-hidden": true },
              namespace: SVG_NAMESPACE,
            },
            [
              h("use", {
                "xlink:href": attributeHook(
                  "http://www.w3.org/1999/xlink",
                  `#${escape(id)}`
                ),
                namespace: SVG_NAMESPACE,
              }),
            ]
          );

          if (params.title) {
            return h(
              "span",
              {
                title: params.title,
                attributes: { class: "svg-icon-title" },
              },
              [svg]
            );
          } else {
            return svg;
          }
        },

      });

      Composer.reopen({
        actions: {
          showWfModal: function() {
            showModal("workflow", { title: "Insert n8n workflow" }).setProperties({
              composerView: this
            });
          }
        }
      });      

      api.onToolbarCreate(toolbar => {
        toolbar.addButton({
          id: 'n8n-wf-button',
          group: 'extras',
          icon: 'network-wired',
          action: 'showWfModal',
          title: 'Insert workflow'
        });
      });

      api.decorateCookedElement(
        elem => { 

          let target = elem.querySelector('div.embedded_workflow img')
          if(target != null && target.getAttribute('src') == "") {

            console.log('Fetching image');
            const wf = decodeURI(target.dataset.workflow);

            //const xhr = new XMLHttpRequest();
            //xhr.open('POST', endpoint);
            //xhr.responseType = 'json';
            //xhr.send(`{"workflow":${wf}}`);

            fetch(endpoint, {
              method: 'POST',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({workflow: JSON.parse(wf)}),
            })
            .then((data) => {
              return data.json();
            })
            .then((data) => {
              let imgUrl = data.imageUrl;
              const image = document.querySelector('div.embedded_workflow > img');
              if (image) {
                target.setAttribute('src', urlStart + imgUrl);
              }
            });
            
          }
        },
        { id: 'n8n_workflow' }
      );
    });
  }
};
