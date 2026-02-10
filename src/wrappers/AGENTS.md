The hierarchy is as follows:

- JJET -> JJN
    - JJN -> JJT
    - JJN -> JJNx (methods common by wrappers that descend from JJN except JJT)
        - JJNx -> JJD
        - JJNx -> JJDF
            - JJDF -> JJSR
        - JJNx -> JJE
            - JJE -> JJEx (methods common by the wrappers that descend from JJE)
                - JJEx -> JJHE
                - JJEx -> JJSE

`JJN.wrap()` is attached to it in `./JJN.ts` because it imports all other wrapper classes. Otherwise there will be a dependency loop.

Tests live in the root `test/` folder. From there, import wrappers via `../src/index.js`.
