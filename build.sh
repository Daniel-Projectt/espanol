#!/bin/sh
# Assemble index.html from src/ and run the tests. Usage: sh build.sh
D="$(cd "$(dirname "$0")" && pwd)"
S="$D/src"
{
  cat "$S/01-meta.html"
  echo '<style>'
  cat "$S/00-greek-base.css"
  cat "$S/01-es.css"
  echo '</style>'
  echo '</head>'
  echo '<body>'
  cat "$S/00-es-defs.html"
  cat "$S/01-shell.html"
  echo '<script>'
  echo '(function(){'
  echo '"use strict";'
  for f in "$S"/02*.js "$S"/03*.js; do cat "$f"; echo; done
  echo '})();'
  echo '</script>'
  echo '</body>'
  echo '</html>'
} > "$D/index.html"
echo "built index.html: $(wc -c < "$D/index.html") bytes"
node "$S/test.js"
