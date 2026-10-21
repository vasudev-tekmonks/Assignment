const crypto = require("crypto");

// In-memory session store.
// The session ID is the key; session data is the value.
const sessions = new Map();

// Demo users.
const users = [
    {
        id: 1,
        username: "vasudev",
        password: "password123",
    },
    {
        id: 2,
        username: "vasu",
        password: "password456",
    },
];

const SESSION_MAX_AGE = Number(process.env.SESSION_MAX_AGE) || 1800000;

function verifyCredentials(username, password) {
    const user = users.find(
        (user) => user.username === username && user.password === password,
    );

    if (!user) {
        return null;
    }

    // Password is never returned. 
    return {
        id: user.id,
        username: user.username,
    };
}

function createSession(user) {
    const sessionId = crypto.randomBytes(32).toString("hex");

    const session = {
        user,
        createdAt: Date.now(),
        expiresAt: Date.now() + SESSION_MAX_AGE,
    };

    sessions.set(sessionId, session);

    return {
        sessionId,
        session,
    };
}

function getSession(sessionId) {
    if (!sessionId) {
        return null;
    }

    const session = sessions.get(sessionId);

    if (!session) {
        return null;
    }

    if (Date.now() >= session.expiresAt) {
        sessions.delete(sessionId);
        return null;
    }

    return session;
}

function deleteSession(sessionId) {
    if (!sessionId) {
        return false;
    }

    return sessions.delete(sessionId);
}

module.exports = {
    verifyCredentials,
    createSession,
    getSession,
    deleteSession,
};
