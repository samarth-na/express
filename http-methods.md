# HTTP methods: universal pseudocode

A language-agnostic reference for the standard HTTP methods. Each section gives
pseudocode for the server handler, plus a one-line client equivalent. Use it as
a checklist when you implement the same route with different methods, like the
ones in `src/routes/playground.js`.

## Conventions used below

- `REQUEST` = the incoming request (method, path, headers, body).
- `RESPONSE` = what the server sends back (status, headers, body).
- `->` means "returns" or "sends".
- `resource` = the thing the path points at (a row, a file, an object).
- `:id` = a route parameter in the path, for example `/items/42`.
- `body` = the parsed request body, available only when the method allows one.

## Summary table

| Method  | Safe | Idempotent | Request body | Typical success |
|---------|------|------------|--------------|-----------------|
| GET     | yes  | yes        | no           | 200             |
| HEAD    | yes  | yes        | no           | 200 (no body)   |
| OPTIONS | yes  | yes        | no           | 204             |
| POST    | no   | no         | yes          | 201             |
| PUT     | no   | yes        | yes          | 200 / 204       |
| PATCH   | no   | no         | yes          | 200 / 204       |
| DELETE  | no   | yes        | optional     | 200 / 204       |
| TRACE   | yes  | yes        | no           | 200             |
| CONNECT | no   | no         | no           | 200 (tunnel)    |

- **Safe**: the method does not change server state.
- **Idempotent**: repeating the same request gives the same result.

## GET — read a resource

```
SERVER:
    on GET path:
        if path has :id:
            item = store.find(:id)
            if item is missing -> RESPONSE 404
            else RESPONSE 200 with item
        else:
            list = store.all()
            RESPONSE 200 with list

CLIENT:
    GET /items/42  ->  read item 42
```

## HEAD — read metadata only

HEAD is GET with the body removed. Express answers HEAD automatically from a GET
route unless you define one yourself.

```
SERVER:
    on HEAD path:
        run the same logic as GET path
        keep the status and headers
        drop the body
        RESPONSE 200 with no body

CLIENT:
    HEAD /items/42  ->  read item 42's headers only
```

## OPTIONS — describe what the path allows

```
SERVER:
    on OPTIONS path:
        allowed = every method with a route on path
        RESPONSE 204
        header Allow = join(allowed, ", ")

CLIENT:
    OPTIONS /items  ->  learn which methods are allowed
```

## POST — create a new resource

```
SERVER:
    on POST path:
        data = body
        if data is invalid -> RESPONSE 400
        item = store.create(data)
        RESPONSE 201
        header Location = path + "/" + item.id
        body = item

CLIENT:
    POST /items  { "name": "third" }  ->  create a new item
```

## PUT — replace a resource

PUT sends the full new version. Create it when missing, or ignore the request.

```
SERVER:
    on PUT path/:id:
        if body is invalid -> RESPONSE 400
        existed = store.exists(:id)
        store.save(:id, body)      // replace, not merge
        if existed -> RESPONSE 200 with body
        else        -> RESPONSE 201 with body

CLIENT:
    PUT /items/42  { "name": "replaced" }  ->  replace item 42
```

## PATCH — update part of a resource

PATCH sends only the fields that change. Merge them into the resource.

```
SERVER:
    on PATCH path/:id:
        item = store.find(:id)
        if item is missing -> RESPONSE 404
        if body is empty    -> RESPONSE 400
        store.merge(item, body)    // change only the given fields
        RESPONSE 200 with item

CLIENT:
    PATCH /items/42  { "name": "patched" }  ->  change one field
```

## DELETE — remove a resource

```
SERVER:
    on DELETE path/:id:
        item = store.find(:id)
        if item is missing -> RESPONSE 404
        store.remove(:id)
        RESPONSE 200 with the removed item   // or 204 with no body

CLIENT:
    DELETE /items/42  ->  remove item 42
```

## TRACE — echo the request back

Usually disabled for security. The server returns the request it received.

```
SERVER:
    on TRACE path:
        RESPONSE 200
        body = the raw request text

CLIENT:
    TRACE /  ->  see what the server received
```

## CONNECT — open a tunnel

Used for proxies and TLS tunnels, not for normal routes.

```
SERVER:
    on CONNECT host:port:
        open a raw two-way connection to host:port
        RESPONSE 200
        tunnel bytes both directions until closed

CLIENT:
    CONNECT example.com:443  ->  request a tunnel
```

## ANY / `router.all` — match every method

A catch-all handler runs for any method. Use it for checks that must run first,
such as auth or logging. Put it before the specific routes when it should block
them, or after when it should only catch the leftovers.

```
SERVER:
    on ANY path:
        do shared work (log, check auth)
        if allowed -> continue to the matching route
        else       -> RESPONSE 401
```

## Universal shape of one handler

Every method handler follows the same five steps. Only the middle differs.

```
SERVER:
    on METHOD path:
        1. read input      -> params, query, headers, body
        2. check input     -> if invalid, RESPONSE 4xx
        3. act on state    -> read, create, replace, merge, or remove
        4. build response  -> status + headers + body
        5. send            -> RESPONSE
```
