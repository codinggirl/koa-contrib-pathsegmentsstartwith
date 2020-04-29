# koa-contrib-pathsegmentsstartwith

a koa middleware, call an user defined middleware if `ctx.path`'s path segments start with a given prefix's path segments.

This is a replacement for `koa-mount`.

## How it works

The middleware wrapper accept town params, `path prefix` and
`middleware` function.

When a http request incoming, the middleware parse the given
path prefix, and `ctx.path`, by spliting them with `/`. It compares
the parsed array (path segments), to determine call the user defined middleware or not.

For example, user given path `/api/v1/` as path prefix, and http
incoming ctx.path is `/api/v1/nice-cat`. The middleware parse them as
arrays, to compare their path segments:

1. given path `/api/v1/` parsed to `['api', 'v1']` (1)
1. ctx.path `/api/v1/nice-cat` parsed to `['api', 'v1', 'nice-cat']` (2)
1. compare (1) & (2), because (2)'s first elements equal to (1)'s elements,
so the path matched, the user defined middleware will be called.

For more information about path and path segments, please refer to [RFC 2396](https://www.ietf.org/rfc/rfc2396.txt).

See chart below for reference.

ctx.path | prefix | matched: call middleware (Y/N)
-        | -      | -
/        |  /api   | N
/api     |  /api   | Y
/api/    |  /api   | Y
/api     | /api/   | Y
/api/    | /api/   | Y
/api/v1  | /api/   | Y
/api/v1  | /api/v  | N
/api/v2  | /api/v2 | Y
/api/v2.0 | /api/v2 | N
/api/v21  | /api/v2 | N
/images   | /image   | N
/images/flower   | /image/   | Y

## Usage

This middleware is path based. If you want a simple string based one, please refer to `koa-contrib-pathstringstartswith`.

Install via npm or yarn.

```
# for npm
npm i --save koa-contrib-pathsegmentsstartwith
# for yarn
yarn add koa-contrib-pathsegmentsstartwith
```

Use as a Koa middleware in your app.

```
// import it
const pathSegmentsStartWith = require('koa-contrib-pathsegmentsstartwith')

// if ctx.path starts with `api/v1`, then call myMiddleware1
app.use(pathSegmentsStartWith('/api/v1', myMiddleware1))

// if ctx.path starts with `api/v2`, then call myMiddleware2
app.use(pathSegmentsStartWith('/api/v2', myMiddleware2))
```

## Compare to `koa-mount`

- This one do not change `ctx.path`, this void many pains.
- This middleware do not mount Koa application.
- It's simple and easy to use.

## LICENSE

[The MIT License](LICENSE).
