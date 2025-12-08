console.log("AI Job Applicator: Eyes open");

const KNOWN_SITES = {
    "boards.greenhouse.io": {
        "first_name" : '#first_name',
        "last_name" : '#last_name',
        "email" : '#email',
        "phone" : '#phone',
        "resume" : "button[aria-label='Upload Resume']"
    },
    "jobs.lever.co" : {
        "first_name" : "input[name='name=']",
        "email" : "input[name='email]",
        //TODO ADD LEVER SPECIFIC SELECTOR 
    }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === "START_AUTOFILL"){
        startAutofill(request.userProfile);
    }
});

async function startAutofill(userProfile) {
    const hostname = window.location.hostname;
    console.log(`Detecting platform: ${hostname}`);

    if(KNOWN_SITES[hostname]){
        console.log("Known site detected! Using fast mode.");
        fillForm(KNOWN_SITES[hostname],userProfile);
        return;
    }

    console.log("Unkown site. Engaging AI Scanner....");

    const simplifiedDOM = getSimplifiedDOM();

    chrome.runtime.sendMessage(
        {type: "ANALYZE_PAGE_WITH_AI", payload: simplifiedDOM},
        (response) => {
            if(response.success && response.mapping){
                console.log("AI Identification complete:", response.mapping);
                fillForm(response.mapping, userProfile);
            } else{
                alert("AI could not read this form. Check console for errors.")
            }
        }
    );
}

    function getSimplifiedDOM(){
        const input = document.querySelectorAll("input, textarea, select");

        return Array.from(inputs).map((el, index) => ({
            id: el.id,
            name: el.name,
            type: el.type,
            placeholder: el.placeholder,
            label: getLabelText(el), //Helper function to find nearby label text
            domId: `ai_ref_${index}`  //Temporary ID we assign to find it back later
        }));
    }

    function getLabelText(element){
        //check label for id
        if(element.id){
            const label = document.querySelector(`label[for="${element.id}"]`);
            if(label){
                return label.innerText;
            }
        }

        //check parent label
        return element.closest("label")?.innerText || "";
    }

    function fillForm(mapping, userProfile){

        // mapping = { "first_name": "#id_of_input", "email": "input[name='email']" }
        for(cont [fieldKey, selector] of Object.entries(mapping)){
            const valueToFill = userProfile[fieldKey];
            if(!valueToFill) continue;

            const element = document.querySelector(selector) || 
                            document.querySelectorAll("input, textarea, select")[selector];
            
            if(element){
                element.focus();
                element.value = valueToFill;
                element.dispatchEvent(new Event('input', {bubbles: true}));
                element.dispatchEvent(new Event('change', {bubbles: true}));
                console.log(`Filled ${fieldKey}`);
            }
        }
    }