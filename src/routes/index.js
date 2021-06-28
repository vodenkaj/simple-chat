import validator from "validator";

function routes(app) {
	app.get("/", (req, res) => {
		res.render("index");
	});

	app.get("/chat", (req, res) => {
		if (
			!req.cookies.sessionid ||
			!app.session.has(req.cookies.sessionid) ||
			app.session.get(req.cookies.sessionid).username == ""
		) res.redirect("");
		else res.render("chat");
	});

	app.post("/login", (req, res) => {
		if (!req.body.username)
			res.send("You need to login first!", 200);
		else {
			app.session.set(req.cookies.sessionid, {
				username: validator.escape(req.body.username),
			});
			res.redirect("chat");
		}
	});

	app.get("*", (req, res) => {
		res.send("Nothing here bud", 404);
	});
}

export default routes;
