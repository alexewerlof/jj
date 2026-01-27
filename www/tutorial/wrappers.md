A key implementation idea in JJ is wrappers. The wrappers add the sugar syntax on top of DOM standard constructs without monkey patching or modifying them.

```mermaid
flowchart LR
    subgraph JJ
        JJET --> JJN

        JJN --> JJNx

        JJN --> JJT

        JJNx --> JJE
        JJNx --> JJDF
        JJNx --> JJD

        JJDF --> JJSR

        JJE --> JJEx

        JJEx --> JJHE
        JJEx --> JJSE
    end

    subgraph DOM
        EventTarget --> Node

        Node --> Element
        Node --> DocumentFragment
        Node --> Document
        Node --> Text

        DocumentFragment --> ShadowRoot

        Element --> HTMLElement
        Element --> SVGElement
    end

    JJET -.wraps.- EventTarget
    JJN -.wraps.- Node
    JJDF -.wraps.- DocumentFragment
    JJSR -.wraps.- ShadowRoot
    JJD -.wraps.- Document
    JJT -.wraps.- Text
    JJE -.wraps.- Element
    JJHE -.wraps.- HTMLElement
    JJSE -.wraps.- SVGElement
```
