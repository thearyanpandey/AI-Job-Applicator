chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === "ANALYZE_PAGE_WITH_AI"){
        console.log("Background: Received DOM analysis request...");
        handleAIAnalysis(request.payload, sendResponse);
        return true;
    };

    if(request.type === "AI_WRITE_COVER_LETTER"){
        handleCoverLetter(request.payload, sendResponse);
        return true;
    }
});

async function handleAIAnalysis(payload, sendResponse) {
    try {
        // Validate the new payload structure
        if(!payload || !payload.domSkeleton || payload.domSkeleton.length === 0){
            throw new Error("DOM Skeleton is empty");
        }

        console.log("Background: Sending complex payload to Node server...");
        console.log("Background Payload Check:", {
                    hasQuestions: !!payload.domSkeleton,
                    hasResume: !!payload.userProfile
                });
                
        // Send the entire payload object (domSkeleton, jobDescription, userProfile)
        const response = await fetch('http://127.0.0.1:3000/analyze-dom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(payload), 
            keepalive: true,  
            mode: 'cors'
        });

        if(!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Background: Received from Node:", data);

        if (data.success) {
            sendResponse({ success: true, mapping: data.fieldMappings });
        } else {
            sendResponse({ success: false, error: data.error });
        }
    } catch(error) {
        console.error("AI Backend Error:", error);
        sendResponse({success: false, error: error.message});
    }
}
