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

async function handleAIAnalysis(domSkeleton, sendResponse) {
    try{
        //Validating payload before sending
        if(!domSkeleton || domSkeleton.length === 0){
            throw new Error("DOM Skeleton is empty");
        }

        console.log ("Background: Sending to Node server...");

        //Call Node Server
        const response = await fetch('http://127.0.0.1:3000/analyze-dom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({domSimplified: domSkeleton}),
            keepalive: true,  
            mode: 'cors'
        });

        if(!response.ok){
            throw new Error(`Sever Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(data , "Data from indexjs background");

        if (data.success) {
        // Pass the 'fieldMappings' exactly as received
        sendResponse({ success: true, mapping: data.fieldMappings });
        } else {
        sendResponse({ success: false, error: data.error });
        }
    } catch(error){
        console.error("AI Backend Error:", error);
        sendResponse({success: false, error: error.message});
    }
}
