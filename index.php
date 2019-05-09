<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PopCha! Movie Network</title>
    <link rel="stylesheet" href="movie-network.css"/>
    <link rel="shortcut icon" href="popcha.ico" type="image/x-icon">
    <script>
        // Sniff MSIE version
        // http://james.padolsey.com/javascript/detect-ie-in-js-using-conditional-comments/
        var ie = (function() {
            var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');
            while (div.innerHTML='<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',all[0]);
            return v > 4 ? v : undef;
        }());

        function takeAction() {
            if( ie && ie < 9 ) {
                D3notok();
            } else {
                // Load D3.js, and once loaded do our stuff
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = "http://d3js.org/d3.v3.min.js";
                script.addEventListener('load', D3ok, false);
                script.onload = "D3ok();";
                head.appendChild(script);
            }
        }
    </script>
</head>
<body onload="takeAction();">
  <div id="nocontent">
    <h1>Sadly your browser is not compatible with this site</h1>
    <div>You can use <a href="http://www.google.com/chrome/">Google
    Chrome</a>, <a href="http://www.mozilla.org/firefox">Mozilla Firefox</a>
    or <a href="http://windows.microsoft.com/en-us/internet-explorer/download-ie">Microsoft
    Internet Explorer (v9 or above)</a> to access the PopCha Movie
    Network</div>
  </div>

  <div id="movieNetwork"></div>

  <div id="sidepanel">
    <div id="title">
      <a href="javascript:void(0);" onClick="zoomCall(0.5);" style="pointer-events: all;">+</a>
      <a href="javascript:void(0);" onClick="zoomCall(-0.5);" style="pointer-events: all;">-</a>
    </div>
    <div id="movieInfo" class="panel_off"></div>
  </div>

  <script src="movie-network.js"></script>
</body>
</html>