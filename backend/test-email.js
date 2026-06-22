import sendWelcomeEmail from './emailService.js';

async function runTest() {
    console.log("---------------------------------------");
    console.log("🚀 STARTING THE POWER TEST...");
    
    // 1. Put your email here
    const testEmail = 'pateldiya636@gmail.com'; 
    
    console.log(`📡 Attempting to send to: ${testEmail}`);

    try {
        const result = await sendWelcomeEmail(testEmail, "Dolce Vita Tester");
        
        if (result) {
            console.log("✅ THE SERVER SAYS YES: The email was sent!");
            console.log("👉 ACTION: Check your Spam and Promotions folders right now.");
        } else {
            console.log("❌ THE SERVER SAYS NO: The function returned 'false'.");
        }
    } catch (err) {
        console.log("💥 CRASHED: There is a bug in the code.");
        console.error(err);
    }
    
    console.log("---------------------------------------");
}

runTest();