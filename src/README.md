This directory contains three types of files:

1. The wrappers contain classes that wrap native DOM classes (the wrappers extend each other similar to the original DOM classes):
    - JJET wraps a DOM EventTarget
    - JJN wraps a DOM Node element and extends JJET
    - JJT wraps a DOM Text and extends JJN
    - JJE wraps a DOM Element and extends JJN
    - JJHE wraps a DOM HTMLElement and extends JJE
    - JJSE wraps a DOM SVGElement and extends JJE
    - JJD wraps a DOM Document and extends JJN
    - JJDF wraps a DOM DocumentFragment and extends JJN
    - JJSR wraps a DOM ShadowRoot and extends JJDF
2. The helpers (eg. case conversion, helpers, etc.)
3. The mixin: due to dependency loop, part of the functionality of JJN is moved to mixin. This file also attaches some methods to other classes using Object.assign().
