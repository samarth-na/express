var express = require("express");
var router = express.Router();

/*
 * Playground: one route per HTTP method so you can see what each one does.
 *
 * Mounted at /playground (see src/app.js).
 * Every handler echoes back what the server received, so you can watch how the
 * method, body, query string, and headers differ between requests.
 */

// Tiny in-memory store so PUT / PATCH / DELETE have something to change.
// Resets every time the server restarts.
var items = {
    1: { id: 1, name: "first item" },
    2: { id: 2, name: "second item" },
};

// Shared shape for the echo responses. Keeping the keys identical across
// methods makes them easy to compare side by side.
function describe(req) {
    return {
        method: req.method,
        path: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
        cookies: req.cookies,
    };
}

/* GET /playground -> list the items */
router.get("/", (_req, res) => {
    console.log(_req);
    res.send();
});

/* GET /playground/methods -> index of every demo route */
router.get("/methods", (_req, res) => {
    res.send({
        GET: "GET /playground or GET /playground/items/:id",
        POST: "POST /playground/items",
        PUT: "PUT /playground/items/:id",
        PATCH: "PATCH /playground/items/:id",
        DELETE: "DELETE /playground/items/:id",
        HEAD: "HEAD /playground/items/:id",
        OPTIONS: "OPTIONS /playground",
        ALL: "ANY method on /playground/anything",
    });
});

/*
 * GET and HEAD share the path /items/:id, so they go on ONE route with
 * router.route(). This matters: Express answers a HEAD request with the GET
 * handler unless the SAME route also defines HEAD. If you wrote router.get()
 * first and router.head() after, the GET route would swallow HEAD requests and
 * your head handler would never run.
 */
router
    .route("/items/:id")
    .get((req, res) => {
        var item = items[req.params.id];
        if (!item) {
            return res.status(404).send({ error: "item not found" });
        }
        res.send(item);
    })
    /*
     * HEAD -> same as GET but with no body. The client still gets status and
     * headers, which is how it checks whether an item exists cheaply.
     */
    .head((req, res) => {
        if (!items[req.params.id]) {
            return res.status(404).end();
        }
        res.set("X-Method-Demo", "HEAD");
        res.end();
    });

/*
 * POST -> create. The body comes from express.json() in app.js.
 * Convention: POST creates a new resource and replies 201 Created.
 */
router.post("/items", (req, res) => {
    var item = req.body;
    if (!item || !item.name) {
        return res.status(400).send({ error: "body must have a name" });
    }
    var id = Object.keys(items).length + 1;
    items[id] = { id: Number(id), name: item.name };
    res.status(201).send(items[id]);
});

/*
 * PUT -> full replace. The client sends the whole new version of the item.
 * Convention: PUT is idempotent, so repeating it gives the same result.
 */
router.put("/items/:id", (req, res) => {
    if (!req.body || !req.body.name) {
        return res.status(400).send({ error: "body must have a name" });
    }
    items[req.params.id] = { id: Number(req.params.id), name: req.body.name };
    res.send(items[req.params.id]);
});

/*
 * PATCH -> partial update. Only the fields you send are changed.
 * Compare with PUT above: PUT replaces, PATCH merges.
 */
router.patch("/items/:id", (req, res) => {
    var item = items[req.params.id];
    if (!item) {
        return res.status(404).send({ error: "item not found" });
    }
    Object.assign(item, req.body);
    res.send(item);
});

/* DELETE -> remove one item */
router.delete("/items/:id", (req, res) => {
    var item = items[req.params.id];
    if (!item) {
        return res.status(404).send({ error: "item not found" });
    }
    delete items[req.params.id];
    res.send({ deleted: item });
});

/*
 * OPTIONS -> describe what the resource allows. Without this handler Express
 * replies with an Allow header built from your routes; here we set our own.
 */
router.options("/", (_req, res) => {
    res.set("Allow", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS");
    res.status(204).end();
});

/*
 * router.all -> matches every method. Useful for auth checks or logging that
 * must run no matter which method was used. This one is the catch-all at the
 * bottom, so it only fires when no route above matched.
 */
router.all("/anything", (req, res) => {
    res.send({
        message: "router.all caught this request, whatever the method was",
        ...describe(req),
    });
});

module.exports = router;
