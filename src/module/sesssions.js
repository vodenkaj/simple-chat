class Session {
    constructor() {
        this.sessions = new Map();
    }

    getUser(id) {

        return this.sessions.has(id) ? this.sessions.get(id) : false;
    }

    setUser(id, data) {

        this.sessions.set(id, data);
    }
}

export default Session;