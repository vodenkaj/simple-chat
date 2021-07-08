import validator from "validator"

function routes(app) {
	app.get("/", (req, res) => {
		if (app.session.getName(req.cookies.sessionid))
			res.redirect("chat")
		else
			res.render("index");
	});

	app.get("/chat", (req, res) => {
		if (
			!req.cookies.sessionid ||
			!app.session.getUser(req.cookies.sessionid) ||
			!app.session.getName(req.cookies.sessionid)
		) res.redirect("");
		else res.render("chat");
	});

	app.post("/login", (req, res) => {
		if (!req.body.username)
			res.send("You have to provide username!", 403);
		else if (app.session.hasName(req.body.username))
			res.send("User with same name is already logged in!", 403);
		else {
			app.session.setName(req.cookies.sessionid,
				validator.escape(req.body.username));
			res.send("chat", 200);
		}
	});

	app.get("*", (req, res) => {
		res.redirect("");
	});
}

export default routes;
