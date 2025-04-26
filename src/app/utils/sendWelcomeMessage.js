import { addMessage } from "../lib/firestoreHelpers";

const sendWelcomeMessage = async (userId) => {
  const message = "Welcome to AuditoryX Open Network 🎧 Your dashboard is ready.";
  await addMessage(userId, message);
};

export default sendWelcomeMessage;
