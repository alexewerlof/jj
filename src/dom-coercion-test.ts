/**
 * Test to understand which DOM APIs throw errors vs silently coerce values.
 *
 * Tests various DOM methods with non-string values:
 * - null
 * - undefined
 * - numbers
 * - objects
 * - arrays
 */

interface TestResult {
    method: string
    input: any
    inputType: string
    behavior: 'throws' | 'coerces' | 'other'
    errorType?: string
    errorMessage?: string
    result?: any
    notes?: string
}

const results: TestResult[] = []

function testValue(method: string, testFn: () => any, input: any): void {
    const inputType = input === null ? 'null' : input === undefined ? 'undefined' : typeof input

    try {
        const result = testFn()
        results.push({
            method,
            input,
            inputType,
            behavior: 'coerces',
            result: String(result),
            notes: `Coerced to: "${String(result)}"`,
        })
    } catch (error) {
        results.push({
            method,
            input,
            inputType,
            behavior: 'throws',
            errorType: error instanceof Error ? error.constructor.name : 'Unknown',
            errorMessage: error instanceof Error ? error.message : String(error),
        })
    }
}

function runTests(): void {
    // Create test element
    const el = document.createElement('div')
    el.id = 'test-element'
    el.setAttribute('data-foo', 'bar')
    document.body.appendChild(el)

    const testInputs: any[] = [
        null,
        undefined,
        42,
        { toString: () => 'custom-object' },
        { foo: 'bar' }, // object without custom toString
        [],
        [1, 2, 3],
    ]

    console.log('🧪 Testing DOM API coercion behavior...\n')

    // Test 1: element.getAttribute(nonString)
    console.log('1️⃣ Testing getAttribute()')
    testInputs.forEach((input) => {
        testValue('getAttribute', () => el.getAttribute(input as any), input)
    })

    // Test 2: element.setAttribute(nonString, value)
    console.log('2️⃣ Testing setAttribute() - key parameter')
    testInputs.forEach((input) => {
        testValue(
            'setAttribute(key)',
            () => {
                el.setAttribute(input as any, 'test-value')
                return el.getAttribute(String(input))
            },
            input,
        )
    })

    // Test 2b: element.setAttribute(key, nonString) - value parameter
    console.log('2️⃣b Testing setAttribute() - value parameter')
    testInputs.forEach((input) => {
        testValue(
            'setAttribute(value)',
            () => {
                el.setAttribute('test-attr', input as any)
                return el.getAttribute('test-attr')
            },
            input,
        )
    })

    // Test 3: element.classList.add(nonString)
    console.log('3️⃣ Testing classList.add()')
    testInputs.forEach((input) => {
        testValue(
            'classList.add',
            () => {
                el.classList.add(input as any)
                return Array.from(el.classList).join(', ')
            },
            input,
        )
    })

    // Test 4: element.dataset[nonString]
    console.log('4️⃣ Testing dataset[] access')
    testInputs.forEach((input) => {
        testValue(
            'dataset[key]',
            () => {
                return el.dataset[input as any]
            },
            input,
        )
    })

    // Test 4b: element.dataset[key] = nonString
    console.log('4️⃣b Testing dataset[] assignment')
    testInputs.forEach((input) => {
        testValue(
            'dataset[key] = value',
            () => {
                el.dataset['testKey'] = input as any
                return el.dataset['testKey']
            },
            input,
        )
    })

    // Test 5: element.querySelector(nonString)
    console.log('5️⃣ Testing querySelector()')
    testInputs.forEach((input) => {
        testValue(
            'querySelector',
            () => {
                return el.querySelector(input as any)
            },
            input,
        )
    })

    // Test 6: element.textContent = nonString
    console.log('6️⃣ Testing textContent assignment')
    testInputs.forEach((input) => {
        testValue(
            'textContent =',
            () => {
                el.textContent = input as any
                return el.textContent
            },
            input,
        )
    })

    // Test 7: document.getElementById(nonString)
    console.log('7️⃣ Testing getElementById()')
    testInputs.forEach((input) => {
        testValue(
            'getElementById',
            () => {
                return document.getElementById(input as any)
            },
            input,
        )
    })

    // Cleanup
    document.body.removeChild(el)
}

function printSummary(): void {
    console.log('\n📊 SUMMARY\n')
    console.log('='.repeat(80))

    // Group by method
    const byMethod = new Map<string, TestResult[]>()
    results.forEach((r) => {
        if (!byMethod.has(r.method)) {
            byMethod.set(r.method, [])
        }
        byMethod.get(r.method)!.push(r)
    })

    byMethod.forEach((methodResults, method) => {
        console.log(`\n${method}:`)
        console.log('-'.repeat(80))

        const throws = methodResults.filter((r) => r.behavior === 'throws')
        const coerces = methodResults.filter((r) => r.behavior === 'coerces')

        if (throws.length > 0) {
            console.log(`  ❌ THROWS on: ${throws.map((r) => r.inputType).join(', ')}`)
            throws.forEach((r) => {
                console.log(`     - ${r.inputType}: ${r.errorType}: ${r.errorMessage}`)
            })
        }

        if (coerces.length > 0) {
            console.log(`  ✅ COERCES: ${coerces.map((r) => r.inputType).join(', ')}`)
            coerces.forEach((r) => {
                console.log(`     - ${r.inputType} → "${r.result}"`)
            })
        }
    })

    console.log('\n' + '='.repeat(80))
    console.log('\n🎯 RECOMMENDATIONS:\n')

    // Methods that need validation
    const needsValidation: string[] = []
    const throwsClearly: string[] = []

    byMethod.forEach((methodResults, method) => {
        const allCoerce = methodResults.every((r) => r.behavior === 'coerces')
        const allThrow = methodResults.every((r) => r.behavior === 'throws')

        if (allCoerce) {
            needsValidation.push(method)
        } else if (allThrow) {
            throwsClearly.push(method)
        } else {
            needsValidation.push(method + ' (mixed behavior)')
        }
    })

    console.log('❌ NEED RUNTIME VALIDATION (silently coerce):')
    needsValidation.forEach((m) => console.log(`   - ${m}`))

    console.log('\n✅ THROW CLEAR ERRORS (can rely on native checks):')
    throwsClearly.forEach((m) => console.log(`   - ${m}`))

    // Export results as JSON for further analysis
    ;(window as any).domCoercionTestResults = results
    console.log('\n💾 Full results available at: window.domCoercionTestResults')
}

// Export for manual testing
export function runDomCoercionTest(): void {
    runTests()
    printSummary()
}

// Auto-run if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            runDomCoercionTest()
        })
    } else {
        // Can run immediately
        console.log('DOM Coercion Test ready. Call runDomCoercionTest() to execute.')
    }
}
