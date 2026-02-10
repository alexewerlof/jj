The library is primarily developed for the browsers but the tests are developed to run in Node.js.
To compensate the gap between the two, we use the popular `jsdom` npm package to emulate DOM API.
Therefore all tests need to import `./attach-jsdom.js` first to ensure the required global variables are using JSDOM instead of window.
