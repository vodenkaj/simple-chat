import * as socketio from "socket.io";
import qs from "querystring";
import validator from "validator";
import {config as cfg} from "../config.js";

function SocketLoader(app) {

	// New socket io instance
	const io = new socketio.Server(app.server);

	// Event fired on every connection made
	io.on("connection", socket => {

		// Getting session id to check if client is logged in
		const id = qs.parse(socket.request.headers["cookie"]).sessionid;
		if (id && app.session.getUser(id) && !app.session.isActive(id)) {

			// Check if client is in disconnect array, if so remove him from the array.
			const idx = app.session.disconnected.indexOf(id);
			if (idx != -1)
				app.session.disconnected.splice(idx, 1);
			app.session.setIsActive(id, true);
			io.to(socket.id).emit("logged", app.session.getName(id));

			// Send the client last cfg.MAX_MSGS messages
			app.store.forEach(msg => {
				io.to(socket.id).emit("chat message", {username: msg.username, text: msg.text});
			})

			socket.sessionid = id;
		}
		else {
			let msg = "You have been disconnected, please refresh the page."
			if (id && app.session.getUser(id) && app.session.isActive(id)) msg = "You can't have multiple sessions open!"
			io.to(socket.id).emit("disconnected", msg);
			socket.disconnect();
		}

		// Event fired on client message
		socket.on("chat message", msg => {

			if (msg.length > cfg.MAX_LEN_MSG) {
				io.to(socket.id).emit("exceeded limit", "Your message exceeded maximum character limit!");
				return;
			}
			else if (Date.now() - app.session.getLastMsg(socket.sessionid) < cfg.MSG_TIME_LIMIT) {
				io.to(socket.id).emit("spam timer", `You have to wait ${cfg.MSG_TIME_LIMIT / 1000} seconds before sending a new message!`);
				return;
			}

			// Sanitize the messages to get rid of possible XSS attack
			msg = validator.escape(msg);

			// Set time on which message was sent
			app.session.setLastMsg(socket.sessionid);

			io.emit("chat message", {username: app.session.getName(socket.sessionid), text: msg});
			if (app.store.length == cfg.MAX_MSGS)
				app.store.shift();

			// Store the message
			app.store.push({username: app.session.getName(socket.sessionid), text: msg});
		});

		socket.on("disconnect", reason => {
			app.session.setDcTime(socket.sessionid);
			app.session.disconnected.push(socket.sessionid);
			app.session.setIsActive(socket.sessionid, false);
		});
	});
}

export default SocketLoader;
