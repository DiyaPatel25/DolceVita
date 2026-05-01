import sendWelcomeEmail from './emailService.js'; 

// Put your email inside the quotes below
const myEmail = 'pateldiya636@gmail.com'; 

console.log("Starting test...");

sendWelcomeEmail(myEmail, 'Future CEO')
    .then(() => console.log("Done! Check your phone."))
    .catch(err => console.error("Failed:", err));
