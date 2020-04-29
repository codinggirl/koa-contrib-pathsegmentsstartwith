/**
 * call a middleware if ctx.path's segments matched prefix's segments
 * @param {string} prefix a prefix string to match
 * @param {function(object, function)} downStream a koa middleware, if prefix matched, the middleware
 * will be called
 * 
 * @returns {function} Koa middleware
 */
function _pathSegmentsStartWith(prefix, downStream) {
    if (typeof prefix !== 'string') {
        throw TypeError('prefix must be string')
    }

    if (typeof downStream !== 'function') {
        throw TypeError('downStream (next) must be middleware function')
    }

    // normalize
    const _url = new URL(prefix, 'https://www.nodejs.org')
    const _prefix = _url.pathname

    const prefixSegments = _prefix.split('/')

    const middleware = async (ctx, upstream) => {
        let matched = false

        if (!ctx.path) {
            // ...
            matched = false
        } else {
            const ctxPathSegments = ctx.path.split('/')
            const prefixSegmentsCount = prefixSegments.length
            const ctxPathSegmentsCount = ctxPathSegments.length

            if (prefixSegmentsCount < ctxPathSegmentsCount) {
                const ctxPathSegmentsParts = ctxPathSegments.splice(0, prefixSegmentsCount)
                matched = JSON.stringify(prefixSegments) === JSON.stringify(ctxPathSegmentsParts)
            } else if (prefixSegmentsCount === ctxPathSegmentsCount) {
                matched = JSON.stringify(prefixSegments) === JSON.stringify(ctxPathSegments)
            } else if (prefixSegmentsCount > ctxPathSegmentsCount) {
                matched = false
            }
        }
    
        if (matched) {
            await downStream()
            return upstream()
        } else {
            return upstream()
        }
    }
    middleware.name = 'koa-contrib-pathsegmentsstartwith'
    return middleware
}

module.exports = _pathSegmentsStartWith
