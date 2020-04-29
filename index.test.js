const pathSegmentsStartWith = require('./')

test('pkg import should ok', () => {
    expect(pathSegmentsStartWith).toBeDefined()
})

test('pkg should be a fn', () => {
    expect(typeof pathSegmentsStartWith).toEqual('function')
})

test('call pkg should return a middleware fn', () => {
    const middleware = pathSegmentsStartWith('/', () => { })
    expect(middleware).toBeDefined()
    expect(typeof middleware).toEqual('function')
})

test('returned middleware should has a name', () => {
    const middleware = pathSegmentsStartWith('/', () => { })
    expect(middleware.name).toBeDefined()
    expect(typeof middleware.name).toEqual('string')
    expect(middleware.name.length).toBeGreaterThan(0)
})

test('call by a empty path shoud not throw', () => {
    expect(() => pathSegmentsStartWith('', () => { })).not.toThrow()
})

test('call by a undefined path shoud throw', () => {
    expect(() => pathSegmentsStartWith(undefined, () => { })).toThrow()
})

test('call by a non-string path shoud throw', () => {
    expect(() => pathSegmentsStartWith(undefined, () => { })).toThrow()
    expect(() => pathSegmentsStartWith(1, () => { })).toThrow()
    expect(() => pathSegmentsStartWith(NaN, () => { })).toThrow()
    expect(() => pathSegmentsStartWith(null, () => { })).toThrow()
    expect(() => pathSegmentsStartWith({}, () => { })).toThrow()
    expect(() => pathSegmentsStartWith([], () => { })).toThrow()
    expect(() => pathSegmentsStartWith(() => { }, () => { })).toThrow()
})

test('call by a non-fn middelware shoud throw', () => {
    expect(() => pathSegmentsStartWith('', 1)).toThrow()
    expect(() => pathSegmentsStartWith('', 1.0)).toThrow()
    expect(() => pathSegmentsStartWith('', NaN)).toThrow()
    expect(() => pathSegmentsStartWith('', Infinity)).toThrow()
    expect(() => pathSegmentsStartWith('', null)).toThrow()
    expect(() => pathSegmentsStartWith('', {})).toThrow()
    expect(() => pathSegmentsStartWith('', [])).toThrow()
    expect(() => pathSegmentsStartWith('', '1')).toThrow()
    expect(() => pathSegmentsStartWith('', '/image')).toThrow()
    expect(() => pathSegmentsStartWith('', undefined)).toThrow()
})

test('upstream & downstream should be called if matched', async () => {
    const upstream = jest.fn().mockImplementation(() => {
    })
    const downstream = jest.fn().mockImplementation(() => {
    })

    const middleware = pathSegmentsStartWith('/api', downstream)

    const ctx = {
        path: '/api/v1'
    }

    await middleware(ctx, upstream)

    expect(downstream).toBeCalled()
    expect(upstream).toBeCalled()
})

test('if not matched, upstream should be called, downstream should not be called', async () => {
    const upstream = jest.fn().mockImplementation(() => {
    })
    const downstream = jest.fn().mockImplementation(() => {
    })

    const middleware = pathSegmentsStartWith('/images', downstream)

    const ctx = {
        path: '/api/v1'
    }

    await middleware(ctx, upstream)

    expect(downstream).not.toBeCalled()
    expect(upstream).toBeCalled()
})

test('if no ctx.path supplied, upstream should be called, downstream should not be called', async () => {
    const upstream = jest.fn().mockImplementation(() => {
    })
    const downstream = jest.fn().mockImplementation(() => {
    })

    const middleware = pathSegmentsStartWith('/images', downstream)

    const ctx = {
        url: '/api/v1'
    }

    await middleware(ctx, upstream)

    expect(downstream).not.toBeCalled()
    expect(upstream).toBeCalled()
})

test('prefix /api/v1, ctx.path /api/v1/cat, upstream should be called, downstream should be called', async () => {
    const upstream = jest.fn().mockImplementation(() => {
    })
    const downstream = jest.fn().mockImplementation(() => {
    })

    const middleware = pathSegmentsStartWith('/api/v1', downstream)

    const ctx = {
        path: '/api/v1/cat'
    }

    await middleware(ctx, upstream)

    expect(downstream).toBeCalled()
    expect(upstream).toBeCalled()
})

test('path prefix uses relative pathes', async () => {

    const ctx = {
        path: '/api/v1/cat'
    }

    // ctx.path = '/api/v1/cat'
    const prefixes = [
        // prefix path: matched
        { '/': true },
        { '/api': true },
        { '/api/': true },
        { '/api/v1': true },
        { '/api/v1/cat': true },
        { '/api/v1/cat/': true },
        { '/api/v1/cat//': false },
        { '/api/v1/cat/jafee': false },
        { '/api/v2': false },
        { '/api/v2/cat': false },
        { '/api/v11': false },
        { '/page': false },
        { '/capi': false },
        { '/apint': false },
        { '/api/cat/../': true },
        { '/api/../../': true },
        { '/api/../../../../cat/../api': true },
        { 'http://a:b@h/api': true },
        { '/a:g': false },
        { '@': false }
    ]
    const fns = prefixes.map((obj, i) => {
        const [k, v] = Object.entries(obj)[0]
        return async () => {
            const prefix = k
            const shouldMathed = v
            
            const upstream = jest.fn().mockImplementation(() => {
            })
            const downstream = jest.fn().mockImplementation(() => {
            })

            const middleware = pathSegmentsStartWith(prefix, downstream)
            await middleware(ctx, upstream)

            console.table([{
                "index in prefixes": i,
                "obj in prefixes": obj,
                "prefix": prefix,
                "ctx.path": ctx.path,
                "should matched": shouldMathed
            }])

            shouldMathed ? expect(downstream).toBeCalled() : expect(downstream).not.toBeCalled()
            expect(upstream).toBeCalled()
        }
    })
    fns.map(async f => f())
})
