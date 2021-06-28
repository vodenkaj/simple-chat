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
}

export default Session;
