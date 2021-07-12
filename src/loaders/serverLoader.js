import helmet from "helmet";
import { v4 as uuid } from "uuid";
import qs from "querystring";
import cookieHelper from "../module/cookieHelper.js";
import {config as cfg} from "../config.js";
import routes from "../routes/index.js";
import Session from "../module/sessions.js";

// Custom object to store sessions
const session = new Session(cfg.SESSION_INTERVAL_TIME, cfg.SESSION_TIMEOUT);

// Array to store last messages
const store = [];

function ServerLoader(app) {

	// Global variables for other files
	app.session = session;
	app.store = store;

	// MIDDLEWARES

	// Using helmet which will provide some basic protection headers
	app.use(helmet({ contentSecurityPolicy: false }));

	// Custom module which extracts all the cookies from the request in to the req.cookies object
	app.use(cookieHelper);

	// Inserting session id into the request
	app.use((req, res, next) => {
		if (!req.cookies.sessionid || !session.getUser(req.cookies.sessionid)) {
			const id = uuid();
			session.setUser(id);
			res.setHeader("Set-Cookie", `sessionid=${id}; SameSite=Lax`);
			req.cookies.sessionid = id;
		}
		next();
	});

	// Setting the view engine, which will be used to render the final html page
	app.set("viewEngine", "ejs");

	// Starting to listen at provided address
	app.listen(cfg.PORT, cfg.ADDRESS, () => {

		const {address, port} = app.server.address();
		console.log(`Server is running at http://${address}:${port}`);
	})

	// Add route handlers into server
	routes(app);
}

export default ServerLoader;
