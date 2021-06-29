class Session {
	constructor() {
		this.sessions = {};
	}

	getUser(id) {
		return this.sessions[id];
	}

	setUser(id, data={name: "", lastMsg: 0}) {
		this.sessions[id] = data;
	}

	delUser(id) {
		delete this.sessions[id];
	}

	setName(id, name) {
		this.sessions[id].name = name;
	}

	getName(id) {
		return this.sessions[id].name;
	}

	setLastMsg(id) {
		this.sessions[id].lastMsg = Date.now()
	}

	getLastMsg(id) {
		return this.sessions[id].lastMsg;
	}

	hasName(username) {
		for (const {name} of Object.values(this.sessions)) {
			if (name == username)
				return true;
		}
		return false;
	}
}

export default Session;
