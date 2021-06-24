
import Server from "./module/server.js";
import ServerLoader from "./loaders/serverLoader.js";


void (async function () {
    try {
        const app = new Server();
        ServerLoader(app);
        
    } catch (err) {
        console.log("Server failed to start! \n %s", err);
    }
})();
