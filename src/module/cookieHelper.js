import qs from "querystring";

function cookieHelper(req, res, next) {
    if (!req.cookies)
        req.cookies = qs.parse(req.headers["cookie"]);
    if (!res.cookies)
        res.cookies = qs.parse(req.headers["cookie"]);
    res.clearCookie = clearCookie;
    next();
}

function clearCookie(id) {
    delete this.cookies[id];
}


export default cookieHelper;