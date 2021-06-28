import http from "http";
import * as ejs from "ejs";
import * as fs from "fs";
import qs from "querystring";

// Config for the server
const cfg = {
    views: "views/",
    viewEngine: "html",
    static: "public",
};

class Server {
    constructor() {
        this.server = http.createServer();
        this.routes = [];
    }

    /**
     * Server starts to listen at provided port,
     * additinally response object is extented with some more functionality.
     * @param port port that server is hosted on
     * @param  {} address default: "localhost" address of the server
     * @param  {} callback default: () => {} function that is called at the end
     */
    listen(port, address = "localhost", callback = () => {}) {
        this.server.listen(port, address, callback);
        this.server.on("request", (req, res) => {
            AddFunctionsToResponse.updateResponseObject(res);
            if (req.url.includes(".js")) {
                    res.send(req.url, 200, "text/javascript", true);
            } else if (req.url.includes(".css")) {
                    res.send(req.url, 200, "text/css", true);
            } else if (req.url.includes(".svg")) {
                res.send(req.url, 200, "image/svg+xml", true);
            } else {
				// Recursive function, binding custom this object to access routes array
                this.routes[0].bind({ idx: 1, routes: this.routes })(req, res);
            }
        });
    }

	/*
	 * Setter for the config object
	 * @param {} prop which propertie of the config to change
	 * @param {} value of the propertie
	 */
    set(prop, value) {
        cfg[prop] = value;
    }

    /**
     * Function that apply middleware for a specific address
     * @param  {} middleware accepts three two arguments request and response objects
     * @param  {} address address on which will middleware work on. It works on all calls by default
     */
    use(middleware, address) {
        this.routes.push(function (req, res) {
            const next =
                this.idx >= this.routes.length
                    ? () => {}
                    : this.routes[this.idx++].bind(this, req, res);
            if (!address || req.url === address) middleware(req, res, next);
        });
    }

    /**
     * URL object is inserted inside request object
     * @param  {} address adress of the url request
     * @param  {} callback callback is called after check if request adrress is correct
     */
    get(address, callback) {
        this.routes.push(function (req, res) {
            const next =
                this.idx >= this.routes.length
                    ? null
                    : this.routes[this.idx++].bind(this, req, res);
            const url = new URL(
                req.connection.encrypted
                    ? "https://"
                    : `http://${req.headers.host}${req.url}`
            );
            if (
                (req.method == "GET" && address == "*") ||
                url.pathname === address
            ) {
                req.URL = url;
                callback(req, res, next);
            } else if (next) next();
        });
    }

    /**
     * URL object is inserted inside request object and body is JSON parsed if body is present
     * @param  {} address adress of the url request
     * @param  {} callback callback is called after check if request adrress is correct
     */
    post(address, callback) {
        this.routes.push(function (req, res) {
            const next =
                this.idx >= this.routes.length
                    ? null
                    : this.routes[this.idx++].bind(this, req, res);
            const url = new URL(
                req.connection.encrypted
                    ? "https://"
                    : `http://${req.headers.host}${req.url}`
            );
            if (req.method == "POST" && url.pathname === address) {
                req.URL = url;
                req.body = "";
                req.on("data", (chunk) => {
                    req.body += chunk;
                    if (req.body.length > 1e6) req.connection.destroy();
                });
                req.on("end", () => {
                    req.body = qs.parse(req.body);
                    callback(req, res);
                });
            } else if (next) next();
        });
    }
}

// Private class that is inserting some functionality into response object
class AddFunctionsToResponse {
    static updateResponseObject(res) {
        Object.getOwnPropertyNames(AddFunctionsToResponse).forEach((func) => {
            if (
                func === "length" ||
                func == "updateResponseObject" ||
                func === "prototype" ||
                func === "name"
            ) {
                return;
            }
            res[func] = AddFunctionsToResponse[func];
        });
    }

    static render(file, data) {
        fs.readFile(
            `${cfg.views}${file}.${cfg.viewEngine}`,
            "utf-8",
            (error, content) => {
                if (error) throw new Error(error);

                if (cfg.viewEngine === "ejs") {
                    content = ejs.render(content, data);
                }

                if (error) this.send(content, 404, "text/html");
                else this.send(content, 200, "text/html");
            }
        );
    }

    static send(data, code, type = "text/plain", isFile) {
        if (isFile) {
            data = data.includes(cfg.static) ? data.slice(1) : data;
            fs.readFile(`${data}`, (error, content) => {
                if (error) throw new Error(error);
                this.writeHead(code, { "Content-Type": type });
                this.end(content);
            });
        } else {
            this.writeHead(code, { "Content-Type": type });
            this.end(data, "utf-8");
        }
    }

    static redirect(url) {
        const reqURL = this.req.URL;
        this.writeHead(301, {
            Location: `${reqURL.protocol}//${reqURL.host}/${url}`,
        });
        this.end();
    }
}

export default Server;
