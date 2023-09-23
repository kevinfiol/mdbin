type Handler = (req: Request, params: Record<string, unknown>) =>
  | Promise<Response | void>
  | Response
  | void;

type Register = (pathname: string, handler: Handler) => void;

interface Route {
  method: string;
  pattern: URLPattern;
  handler: Handler;
}

export class Router {
  routes: Route[];
  get: Register;
  post: Register;

  constructor() {
    this.routes = [];
    this.get = this.add.bind(this, 'GET');
    this.post = this.add.bind(this, 'POST');
  }

  add(method = 'GET', pathname = '', handler: Handler): void {
    this.routes.push({
      method,
      pattern: new URLPattern({ pathname }),
      handler,
    });
  }

  async handler(req: Request): Promise<Response> {
    let res: Response | void;

    for (const route of this.routes) {
      if (
        route.method === req.method &&
        (route.pattern.pathname === '*' || route.pattern.test(req.url))
      ) {
        const result = route.pattern.exec(req.url);
        const params = result?.pathname.groups || {};
        res = await route.handler(req, params);
        if (res) return res;
      }
    }

    return new Response('404', { status: 404 });
  }
}
