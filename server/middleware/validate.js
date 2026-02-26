// Generic Middleware to validate request body, query, and params using Zod schemas

export function validate({ body, query, params }) {
    return (req, _res, next) => {
        try {
        req.validated = {};

        if (body) req.validated.body = body.parse(req.body);
        if (query) req.validated.query = query.parse(req.query);
        if (params) req.validated.params = params.parse(req.params);

        next();
        } catch (err) {
        next(err);
        }
    };
}