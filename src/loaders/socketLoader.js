import * as socketio from "socket.io";
import qs from "querystring";
import validator from "validator";
import {config as cfg} from "../config.js";

function SocketLoader(app) {

	const io = new socketio.Server(app.server);

	io.on("connection", (socket) => {
		const id = qs.parse(socket.request.headers["cookie"]).sessionid;
		if (id && app.session.has(id)) {
			io.to(socket.id).emit("logged", app.session.get(id).username);
			app.store.forEach(msg => {
				io.to(socket.id).emit("chat message", {username: msg.username, text: msg.text});
			})
		}
		else {
			io.to(socket.id).emit("disconnected", "You have been disconected.");
			socket.disconnect();
		}

		socket.on("chat message", msg => {
			const id = qs.parse(socket.request.headers["cookie"]).sessionid;
			if (msg.length > cfg.MAX_LEN_MSG) {
				io.to(socket.id).emit("exceeded limit", {username: msg.username, text: msg.text});
				return;
			}
			else if (!id || !app.session.has(id)) {
				io.to(socket.id).emit("disconnected", "You have been disconected, please refresh the page.");
				return;
			}

			msg = validator.escape(msg);
			io.emit("chat message", {username: app.session.get(id).username, text: msg});
			if (app.store.length == cfg.MAX_MSGS)
				app.store.shift();
			app.store.push({username: app.session.get(id).username, text: msg});
		});
	});
}

export default SocketLoader;
