chrome.runtime.onMessage.addListerner((request, sender, sendResponse) => {
    if(request.type === "ANALYZE_PAGE_WITH_AI"){
        handleAIAnalysis(request.payload, sendResponse);
        return true;
    };
});

async function handleAIAnalysis(domSkeleton, sendResponse) {
    try{
        const response = await fetch('https://localhost:3000/analyze-dom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({domSimplified: domSkeleton})
        });

        const data = await response.json();
        console.log(data , "Data from indexjs background");

        sendResponse({success: true, mapping: data.fieldMappings});
    } catch(error){
        console.error("AI Backend Error:", error);
        sendResponse({success: false, error: error.message});
    }
}