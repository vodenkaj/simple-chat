import helmet from "helmet";
import * as socketio from "socket.io";
import { v4 as uuid } from "uuid";
import qs from "querystring";
import cookieHelper from "../module/cookieHelper.js";
import validator from "validator";

const session = new Map();

const store = [];

function ServerLoader(app) {

    // MIDDLEWARES

    // Using helmet which will provide some basic protection headers
    app.use(helmet({ contentSecurityPolicy: false }));

    // Custom module which extracts all the cookies from the request in to the req.cookies object
    app.use(cookieHelper);

    // Inserting session id into the request
    app.use((req, res, next) => {
        if (!req.cookies.sessionid || !session.has(req.cookies.sessionid)) {
            const id = uuid();
            session.set(id, { username: "" });
            res.setHeader("Set-Cookie", `sessionid=${id}`);
        }
        next();
    });

    // Setting the view engine, which will be used to render the final html page
    app.set("viewEngine", "ejs");

    // Starting to listen at provided adress
    app.listen(4500, "192.168.0.102", () => {

        const {address, port} = app.server.address();
        console.log(`Server is running at http://${address}:${port}`);
    })

    const io = new socketio.Server(app.server);

    io.on("connection", (socket) => {
        const id = qs.parse(socket.request.headers["cookie"]).sessionid;
        if (id && session.has(id)) {
            io.to(socket.id).emit("logged", session.get(id).username);
            store.forEach(msg => {
                io.to(socket.id).emit("chat message", {username: msg.username, text: msg.text});
            })
        }
        else {
            io.to(socket.id).emit("disconnected", "You have been disconected.");
            socket.disconnect();
        }

        socket.on("chat message", msg => {
            const id = qs.parse(socket.request.headers["cookie"]).sessionid;
            if (msg.length > 500) {
                io.to(socket.id).emit("exceeded limit", {username: msg.username, text: msg.text});
                return;
            }
            else if (!id || !session.has(id)) {
                io.to(socket.id).emit("disconnected", "You have been disconected, please refresh the page.");
                return;
            }

            msg = validator.escape(msg);
            io.emit("chat message", {username: session.get(id).username, text: msg});
            if (store.length == 10) 
                store.shift();
            store.push({username: session.get(id).username, text: msg});
        });
    });

    app.get("/", (req, res) => {
        res.render("index");
    });

    app.get("/chat", (req, res) => {
        if (
            !req.cookies.sessionid ||
            !session.has(req.cookies.sessionid) ||
            session.get(req.cookies.sessionid).username == ""
        ) res.redirect("");  
        else res.render("chat");
    });

    app.post("/login", (req, res) => {
        if (!req.body.username) res.send("You need to login first!", 200);
        else {
            session.set(req.cookies.sessionid, {
                username: validator.escape(req.body.username),
            });
            res.redirect("chat");
        }
    });

    app.get("*", (req, res) => {
        res.send("Nothing here bud", 404);
    });
}

export default ServerLoader;