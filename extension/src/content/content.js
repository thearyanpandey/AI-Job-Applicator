console.log("AI Job Applicator: Eyes open");

const KNOWN_SITES = [
    {
        domain: "greenhouse.io",
        selector: {
            "first_name" : "#first_name",
            "last_name" : "#last_name",
            "email" : "#email",
            "phone": "#phone",
            "resume" : "button[aria-label='Upload Resume'], button[data-source='attach']"
        }
    },
    {
        domain : "lever.co",
        selector : {
            "first_name" : "input[name='name']",
            "email" : "input[name='email']",
            "phone" : "input[name='phone']",
            "resume" : "input[type='file']"
        }
    }
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === "START_AUTOFILL"){
        startAutofill(request.userProfile);
    }
});

async function startAutofill(userProfile) {
    const hostname = window.location.hostname;
    console.log(`Detecting platform: ${hostname}`);

    //TIER 1: Fast Lane 
    const matchedSite = KNOWN_SITES.find(site => hostname.includes(site.domain));

    if(matchedSite){
        console.log(`Known site detected (${matchedSite.domain})! Using fast mode.`);
        fillForm(matchedSite.selector, userProfile);
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

        return Array.from(input).map((el, index) => ({
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

// function fillForm(mapping, userProfile){

//     // mapping = { "first_name": "#id_of_input", "email": "input[name='email']" }
//     for(const [fieldKey, selector] of Object.entries(mapping)){
//         const valueToFill = userProfile[fieldKey];
//         if(!valueToFill) continue;

//         const element = document.querySelector(selector) || 
//                         document.querySelectorAll("input, textarea, select")[selector];
        
//         if(element){
//             element.focus();
//             element.value = valueToFill;
//             element.dispatchEvent(new Event('input', {bubbles: true}));
//             element.dispatchEvent(new Event('change', {bubbles: true}));
//             console.log(`Filled ${fieldKey}`);
//         }
//     }
// }

function fillForm(mapping, userProfile) {
  console.log("✍️ Filling form with mapping:", mapping);

  for (const [fieldKey, selector] of Object.entries(mapping)) {
    let valueToFill = userProfile[fieldKey];

    // Special Logic: Handle "Full Name" if the user only has First/Last
    if (fieldKey === 'full_name' && !valueToFill) {
      valueToFill = `${userProfile.first_name} ${userProfile.last_name}`;
    }

    if (!valueToFill) continue;

    // Use the selector ID directly if it's an ID, or querySelector
    // The AI might return just the ID string "input_123" or a selector "#input_123"
    let element;
    if (selector.startsWith('#') || selector.startsWith('.') || selector.includes('[')) {
        element = document.querySelector(selector);
    } else {
        element = document.getElementById(selector);
    }

    if (element) {
      element.focus();
      element.value = valueToFill;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.blur(); // Blur helps trigger validation on some sites
    }
  }
}