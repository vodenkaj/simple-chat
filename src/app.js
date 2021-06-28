import Server from "./module/server.js";
import ServerLoader from "./loaders/serverLoader.js";
import SocketLoader from "./loaders/socketLoader.js";

void (async function () {
    try {
        const app = new Server();
        ServerLoader(app);
		SocketLoader(app);

    } catch (err) {
        console.log("Server failed to start! \n %s", err);
    }
})();
