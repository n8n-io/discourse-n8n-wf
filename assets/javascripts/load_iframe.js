
  var s = { insideIframe: false } 

  var toggleCodeVisibility = (src, hide) => {
    //console.log(src.parentElement.parentElement)
    var elem = src.parentElement.parentElement.querySelector('#code');
    //var elem = src.parentElement.parentElement.getElementById('code');
    console.log(elem)
    var value = (hide) ? 'none' : 'block';
    console.log(value)
    elem.style.setProperty('display', value);

  };

	window.onload = () => {
    // If we're moused over an iframe, don't scroll the parent page when the iframe scrolls
    document.addEventListener('scroll', function() {
        if (s.insideIframe) {
          //console.log('scrolling inside');
          window.scrollTo(s.scrollX, s.scrollY);
        } else {
          //console.log('scrolling outside');
        }
    });
	};

  var getIframe = () => {
    return document.querySelector('iframe#int_iframe');
  };

	//var loadWorkflow = (workflow) => {
		//try {
			////const iframe = document.querySelector('iframe#int_iframe');
      //const iframe = getIframe();
			//iframe.contentWindow.postMessage(JSON.stringify(
				//{
					//command: 'openWorkflow',
					//workflow,
				//}
			//), '*');
		//} catch (e) {
      //console.log('error invalid json');
		//}
	//};

  var prepareWorkflow = (elem) => {
    var callback = ({ data, source }) => {

      // Check this is an event for the correct iframe
      if(elem.contentWindow !== source) return;

      try {
        const json = JSON.parse(data);
        if (json.command === 'openNDV') {
          // expand iframe
          //console.log('open ndv')	;
          elem.style = 'position:fixed; top:0; left:0; height:100%; width:100%; z-index:9999999';
        }
        else if (json.command === 'closeNDV') {
          // close iframe
          //console.log('close ndv');
          elem.style = 'width:100%;border:0;display:block';
        }
      } catch (e) {
        console.log(e);
      }
    };
    window.addEventListener('message', callback);

    // Log when we enter the iframe so that we can prevent page scrolling
    elem.addEventListener('mouseenter', function() {
      //console.log('entered');
      s.insideIframe = true;
      s.scrollX = window.scrollX;
      s.scrollY = window.scrollY;
    });
    
    // Log when we leave the iframe so that we can re-enable page scrolling
    elem.addEventListener('mouseleave', function() {
      //console.log('left');
      s.insideIframe = false;
    });
  };
