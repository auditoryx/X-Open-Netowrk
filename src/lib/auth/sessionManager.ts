type SessionStatus = 'authenticated' | 'unauthenticated' | 'loading';
type Callback = (status: SessionStatus) => void;

let currentStatus: SessionStatus = 'unauthenticated';
const listeners = new Set<Callback>();

export const sessionManager = {
  getSessionStatus(): SessionStatus {
    return currentStatus;
  },
  setSessionStatus(status: SessionStatus) {
    currentStatus = status;
    for (const cb of listeners) cb(status);
  },
  onSessionChanged(cb: Callback) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

