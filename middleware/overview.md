Middleware functions are functions that have access to the request object (req), the response object (res), and the next function in the application’s request-response cycle. The next function is a function in the Express router which, when invoked, executes the middleware succeeding the current middleware.

Middleware functions can perform the following tasks:

    Execute any code.
    Make changes to the request and the response objects.
    End the request-response cycle.
    Call the next middleware in the stack.

If the current middleware function does not end the request-response cycle, it must call next() to pass control to the next middleware function. Otherwise, the request will be left hanging.

The following figure shows the elements of a middleware function call:

The middleware function.
Callback argument to the middleware function, called "next" by convention.
HTTP response argument to the middleware function, called "res" by convention.
HTTP request argument to the middleware function, called "req" by convention.

Starting with Express 5, middleware functions that return a Promise will call next(value) when they reject or throw an error. next will be called with either the rejected value or the thrown Error.
Example

Here is an example of a simple “Hello World” Express application. The remainder of this article will define and add three middleware functions to the application: one called myLogger that prints a simple log message, one called requestTime that displays the timestamp of the HTTP request, and one called validateCookies that validates incoming cookies.

```ts
app.get("/", (req, res) => {
    res.send("Hello World!"); // middleware
});
app.listen(3000);
```
