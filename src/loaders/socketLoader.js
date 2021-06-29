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
		if (id && app.session.getUser(id)) {
			io.to(socket.id).emit("logged", app.session.getName(id));
			app.store.forEach(msg => {
				io.to(socket.id).emit("chat message", {username: msg.username, text: msg.text});
			})
		}
		else {
			io.to(socket.id).emit("disconnected", "You have been disconnected.");
			socket.disconnect();
		}

		// Event fired on client message
		socket.on("chat message", msg => {

			// Getting session id to check if client is logged in
			const id = qs.parse(socket.request.headers["cookie"]).sessionid;

			if (!id || !app.session.getUser(id)) {
				io.to(socket.id).emit("disconnected", "You have been disconected, please refresh the page.");
				return;
			}
			else if (msg.length > cfg.MAX_LEN_MSG) {
				io.to(socket.id).emit("exceeded limit", "Your message exceeded maximum character limit!");
				return;
			}
			else if (Date.now() - app.session.getLastMsg(id) < cfg.MSG_TIME_LIMIT) {
				io.to(socket.id).emit("spam timer", `You have to wait ${cfg.MSG_TIME_LIMIT / 1000} seconds before sending a new message!`);
				return;
			}

			// Sanitize the messages to get rid of possible XSS attack
			msg = validator.escape(msg);
			
			// Set time on which message was sent
			app.session.setLastMsg(id);
			
			io.emit("chat message", {username: app.session.getName(id), text: msg});
			if (app.store.length == cfg.MAX_MSGS)
				app.store.shift();

			// Store the message
			app.store.push({username: app.session.getName(id), text: msg});
		});

		socket.on("disconnect", reason => {
			const id = qs.parse(socket.request.headers["cookie"]).sessionid;
			if (!id || !app.session.getUser(id)) {
				return;
			}
			app.session.delUser(id);
		});
	});
}

export default SocketLoader;
