export const config = {};

config.ADDRESS = "localhost";
config.PORT = 4500;
config.MAX_MSGS = 10; // Size of the array for storing recent messages
config.MAX_LEN_MSG = 500; // Maximum length of one message
config.MSG_TIME_LIMIT = 5000; // Time before client can send a new message (ms)
config.SESSION_INTERVAL_TIME = 60000 // Interval in which server checks if there are any sessions to be destroyed (ms)
config.SESSION_TIMEOUT = 2700000 // Time before session is destroyed (ms)
