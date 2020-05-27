require = require('esm')(module/*, options*/)
const { promisify } = require('util')
const path = require('path')
const glob = promisify(require('glob'))
const am = require('am')
 
async function main() {
    const files = await glob('**/*.spec.js')
    for (let file of files) {
        const contents = require(path.resolve(process.cwd(), file))
        const testFns = Object.values(contents).filter(f => typeof f === 'function')
        for (let testFn of testFns) {
            console.log(`> ${file}:${testFn.name}()`)
            await testFn()
        }
    }
}

am(main)
