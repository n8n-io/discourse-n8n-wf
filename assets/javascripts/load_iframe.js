
	const sampleWorkflow = {
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [
        250,
        300
      ]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json[\"body\"][\"token\"]}}",
              "operation": "notEqual",
              "value2": "54iz37xumjg9ue6bo8ygqifb8y"
            }
          ]
        }
      },
      "name": "IF",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [
        650,
        300
      ]
    },
    {
      "parameters": {},
      "name": "NoOp",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [
        850,
        160
      ]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "resource": "file",
        "operation": "edit",
        "owner": "mutdmour",
        "repository": "={{$json[\"repo\"]}}",
        "filePath": "Dockerfile",
        "fileContent": "=FROM node:14.16-alpine\n\n# pass N8N_VERSION Argument while building or use default\nARG N8N_VERSION=0.98.0\n\n# Update everything and install needed dependencies\nRUN apk add --update graphicsmagick tzdata\n\n# Set a custom user to not have n8n run as root\nUSER root\n\nRUN node --version\n\n# Install n8n and the also temporary all the packages\n# it needs to build it correctly.\n# RUN apk --update add --virtual build-dependencies python build-base && \\\n# \tnpm_config_user=root npm install -g n8n@${N8N_VERSION} && \\\n# \tapk del build-dependencies\n\nRUN apk --update add --virtual build-dependencies python2 python3 build-base && \\\n\tapk --update add git && \\\n\tapk del build-dependencies\n\nRUN N8N_CORE_BRANCH={{$json[\"branch\"]}} && \\\n    git clone https://github.com/n8n-io/n8n && \\\n\tcd n8n && \\\n    echo $N8N_CORE_BRANCH && \\\n    git fetch origin $N8N_CORE_BRANCH && \\\n    git checkout $N8N_CORE_BRANCH && \\\n\tnpm install -g typescript && \\\n\tnpm install -g lerna && \\\n\tnpm install && \\\n\tlerna bootstrap --hoist && \\\n\tnpm_config_user=root npm run build \n\n# Specifying work directory\nWORKDIR /data\n\n# copy start script to container\nCOPY ./start.sh /\n\n# make the script executable\nRUN chmod +x /start.sh\n\n# define execution entrypoint\nCMD [\"/start.sh\"]",
        "commitMessage": "=n8n bot - deploy branch {{$json[\"branch\"]}}"
      },
      "name": "GitHub",
      "type": "n8n-nodes-base.github",
      "typeVersion": 1,
      "position": [
        1210,
        480
      ],
      "credentials": {
        "githubOAuth2Api": {
          "id": "40",
          "name": "Github account"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "const responseUrl = items[0].json.body.response_url;\nconst text = items[0].json.body.text;\nconst [todeploy, branch] = text.split(' ');\nconst instances = todeploy.split(',');\nreturn Array.from(new Set(instances)).map((name) => ({\n  json: {\n    name,\n    repo: `n8n-heroku-${name}`,\n    branch,\n    responseUrl,\n    instanceUrl: `https://n8n-${name}.herokuapp.com/`,\n    username: name,\n    password: 'test1234'\n  }\n}));\n"
      },
      "name": "Function1",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [
        850,
        430
      ]
    },
    {
      "parameters": {},
      "name": "NoOp1",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [
        1000,
        520
      ]
    },
    {
      "parameters": {
        "mode": "passThrough",
        "output": "input2"
      },
      "name": "Merge",
      "type": "n8n-nodes-base.merge",
      "typeVersion": 1,
      "position": [
        1260,
        770
      ]
    },
    {
      "parameters": {
        "requestMethod": "POST",
        "url": "={{$json[\"responseUrl\"]}}",
        "responseFormat": "string",
        "options": {},
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "text",
              "value": "=Updated {{$json[\"repo\"]}} with \"{{$json[\"branch\"]}}\" branch. Should take effect in 10 or so minutes.\nYou can follow its progress here https://github.com/mutdmour/n8n-heroku-{{$json[\"username\"]}}/deployments/activity_log?environment=n8n-{{$json[\"username\"]}}\n\nURL: {{$json[\"instanceUrl\"]}}\nusername: {{$json[\"username\"]}}\npassword: {{$json[\"password\"]}}"
            }
          ]
        }
      },
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [
        1460,
        770
      ]
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "5b44d7e0-0221-4886-a416-0070ac8cae67",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        430,
        290
      ],
      "webhookId": "5b44d7e0-0221-4886-a416-0070ac8cae67"
    }
  ],
  "connections": {
    "IF": {
      "main": [
        [
          {
            "node": "NoOp",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Function1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "GitHub": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Function1": {
      "main": [
        [
          {
            "node": "NoOp1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "NoOp1": {
      "main": [
        [
          {
            "node": "GitHub",
            "type": "main",
            "index": 0
          },
          {
            "node": "Merge",
            "type": "main",
            "index": 1
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "HTTP Request",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook": {
      "main": [
        [
          {
            "node": "IF",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
};

	window.onload = () => {
		//const textarea = document.querySelector('textarea');
		//textarea.value = JSON.stringify(sampleWorkflow);
    //alert('JS loaded');
	};

  var getIframe = () => {
    return document.querySelector('iframe#int_iframe');
  };

	var loadWorkflow = (workflow) => {
		try {
			//const iframe = document.querySelector('iframe#int_iframe');
      const iframe = getIframe();
			iframe.contentWindow.postMessage(JSON.stringify(
				{
					command: 'openWorkflow',
					workflow,
				}
			), '*');
		} catch (e) {
			console.log('error invalid json');
		}
	};

	const loadTextAsWorkflow = () => {
		const textarea = document.querySelector('textarea');
		const workflow = JSON.parse(textarea.value);
		loadWorkflow(workflow);
	}

	//document.querySelector('button').addEventListener('click', loadTextAsWorkflow);

  var prepareWorkflow = (workflowJson) => {
    const iframe = getIframe();
    iframe.style.setProperty('height', '300px');
    var callback = ({ data }) => {
      try {
        const json = JSON.parse(data);
        if (json.command === 'n8nReady') {
          console.log('n8n ready');
          //loadTextAsWorkflow();
          console.log(workflowJson);
          loadWorkflow(JSON.parse(workflowJson));
          window.removeEventListener('message', callback);
        }
        else if (json.command === 'openNDV') {
          // expand iframe
          console.log('open ndv')	;
        }
        else if (json.command === 'closeNDV') {
          // close iframe
          console.log('close ndv');
        }
      } catch (e) {
      }
    };
    window.addEventListener('message', callback);
  };

