class Session {
	constructor(intervalTime, timeout) {
		this.sessions = {}; // Object to store sessions
		this.disconnected = []; // Array to store which clients are offline

		// Interval in which server checks if offline clients should be removed from session object
		setInterval(() => {
			const newArray = [];
			this.disconnected.forEach(id => {
				const client = this.sessions[id];
				if (Date.now() - client.dcTime > timeout) {
					this.delUser(id);
				}
				else newArray.push(id);
			});
			this.disconnected = newArray;
		}, intervalTime);
	}

	getUser(id) {
		return this.sessions[id];
	}

	setUser(id, data={name: "", lastMsg: 0, dcTime: 0, isActive: false}) {
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

	// When ever client disconnects, this parameter is set
	setDcTime(id) {
		this.sessions[id].dcTime = Date.now();
	}

	// To prevent client from opening more sessions
	isActive(id) {
		return this.sessions[id].isActive;
	}

	setIsActive(id, isActive) {
		this.sessions[id].isActive = isActive;
	}
}

export default Session;
