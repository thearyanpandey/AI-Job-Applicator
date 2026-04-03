import Fuse from 'fuse.js';

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

    console.log("🕵️‍♂️ TRIPWIRE 1 - Received userProfile in startAutofill:", userProfile);

    // --- TIER 0: The Cache ---
    const cacheKey = `mapping_${hostname}`;
    const cachedData = await new Promise((resolve) => {
        chrome.storage.local.get([cacheKey], (result) => {
            resolve(result[cacheKey]);
        });
    });

    if (cachedData) {
        console.log(`⚡ Cache hit for ${hostname}! Skipping everything else.`);
        fillForm(cachedData, userProfile);
        return;
    }

    // --- TIER 1: Fast Lane ---
    // const matchedSite = KNOWN_SITES.find(site => hostname.includes(site.domain));
    // if (matchedSite) {
    //     console.log(`🏎️ Known site detected (${matchedSite.domain})!`);
    //     fillForm(matchedSite.selector, userProfile);
    //     return;
    // }

    console.log("🤖 Unknown site. Engaging Smart Scanner...");

    // 1. Grab the Job Description (for Cover Letters later)
    const jobDescription = getJobDescription();
    
    // 2. Extract and prune the form fields
    const cleanElements = getSimplifiedDOM();

    if (cleanElements.length === 0) {
        console.log("No valid form inputs found on this page.");
        return;
    }

    // --- TIER 2: Local Fuzzy Matching ---
    const { localMapping, unresolvedElements } = performFuzzyMatching(cleanElements, userProfile);
    
    console.log("🧠 Local matching solved:", localMapping);
    console.log("❓ Leftovers for AI:", unresolvedElements);

    const debugTable = unresolvedElements.map(el => ({ 
        Virtual_ID: el.domId, 
        Input_Type: el.type,
        Question_Label: el.label 
    }));
    console.table(debugTable);

    // If local matching solved EVERYTHING, we don't even need the AI!
    if (unresolvedElements.length === 0) {
        console.log("🎯 Local matching solved 100% of the form!");
        chrome.storage.local.set({ [cacheKey]: localMapping }); // Save to cache
        fillForm(localMapping, userProfile);
        return;
    }

    // --- TIER 3: AI Fallback ---
    console.log("Sending leftovers and JD to AI Backend...");

    // Notice we are sending an object now, not just an array
    chrome.runtime.sendMessage(
        { 
            type: "ANALYZE_PAGE_WITH_AI", 
            payload: {
                domSkeleton: unresolvedElements,
                jobDescription: jobDescription,
                userProfile: userProfile
            } 
        },
        (response) => {
            if (response && response.success && response.mapping) {
                console.log("✅ AI Identification complete:", response.mapping);
                
                // Combine our local Javascript matches with the AI's matches
                const finalMapping = { ...localMapping, ...response.mapping };

                // Save the COMPLETE mapping to cache so we never pay for this site again
                chrome.storage.local.set({ [cacheKey]: finalMapping }, () => {
                    console.log(`💾 Saved complete mapping to cache for ${hostname}`);
                });

                fillForm(finalMapping, userProfile);
            } else {
                console.error("AI failed or returned an error:", response?.error);
                alert("AI could not read the remaining fields. Check console for errors.");
                
                // Even if AI fails, we can still fill what our local Javascript found!
                fillForm(localMapping, userProfile); 
            }
        }
    );
}

function getSimplifiedDOM() {
    
    const inputSelectors = [
        "input", 
        "textarea", 
        "select", 
        "[role='combobox']", 
        "[role='radiogroup']", 
        "[role='listbox']"
    ].join(", ");
    
    const inputs = document.querySelectorAll(inputSelectors);
    const cleanElements = [];

    Array.from(inputs).forEach((el, index) => {
        // 1. RUTHLESS PRUNING: Skip hidden, disabled, or structural junk
        if (el.type === 'hidden' || el.type === 'submit' || el.disabled || el.style.display === 'none') return;
        
        //skiping elements that are visually hidden but still in DOM
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

        const nameAttr = (el.name || '').toLowerCase();
        if (nameAttr.includes('search') || nameAttr.includes('password')) return;

        // 2. EXTRACT THE EXACT QUESTION/LABEL
        //const labelText = getLabelText(el) || el.placeholder || el.ariaLabel || nameAttr; 
        const labelText = getLabelText(el);

        // Skip if we couldn't find any text associated with it
        if (!labelText.trim()) return;

        cleanElements.push({
            domId: `ai_ref_${index}`,
            type: el.type,
            label: labelText.trim().replace(/\s+/g, ' '), // Clean up weird line breaks
            selectorId: el.id // We keep this to focus/fill it later
        });
    });

    return cleanElements;
}

// Ensure your getLabelText function from before is still here!
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

function getJobDescription() {
    // A heuristic approach: find containers that likely hold the job description
    const selectors = [
        '#job-description', '.job-description', '[data-ui="job-description"]',
        '.posting-requirements', '.description', 'article'
    ];
    
    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.length > 200) {
            return el.innerText.substring(0, 3000); // Limit to 3000 chars to save AI tokens
        }
    }
    
    // Fallback: just grab the body text and hope for the best (chopped to save tokens)
    return document.body.innerText.substring(0, 3000); 
}

function fillForm(mapping, userProfile) {
    console.log("✍️ Filling form with mapping:", mapping);

    for (const [key, value] of Object.entries(mapping)) {
        let textToFill = "";
        let selector = "";

        // Case 1: Local Mapping (e.g., key is "first_name", value is "ai_ref_0")
        if (userProfile[key]) {
            textToFill = userProfile[key];
            selector = value; 
        } 
        // Case 2: AI Direct Answer (e.g., key is "ai_ref_5", value is "My custom answer")
        else {
            textToFill = value; 
            selector = key; 
        }

        // Special Full Name Logic
        if (key === 'full_name' && !userProfile.full_name) {
             textToFill = `${userProfile.first_name} ${userProfile.last_name}`;
        }

        if (!textToFill) continue;

        let element = document.querySelector(selector) || document.getElementById(selector);
        
        // Fallback: If it's a virtual ID like 'ai_ref_5', grab it by index
        if (!element && selector.startsWith('ai_ref_')) {
            const index = parseInt(selector.replace('ai_ref_', ''));
            const inputs = document.querySelectorAll("input, textarea, select");
            element = inputs[index];
        }

        if(element.type === 'file'){
                console.log(`Skipping file input for ${key}`)
                continue;
            }

        if (element) {
            element.focus();
            element.value = textToFill;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.blur();
        }
    }
}

function performFuzzyMatching(cleanElements, userProfile) {
    const localMapping = {};
    const unresolvedElements = [];

    // Setup Fuse.js to search through the labels we scraped
    const fuseOptions = {
        keys: ['label'],
        threshold: 0.3, // 0.0 is perfect match, 1.0 is anything. 0.3 is safely fuzzy.
        includeScore: true
    };
    const fuse = new Fuse(cleanElements, fuseOptions);

    // Define search terms for your profile keys to catch variations
    const searchTerms = {
        first_name: "first name given",
        last_name: "last name family",
        email: "email address",
        phone: "phone number mobile",
        linkedin: "linkedin profile url",
        github: "github portfolio website"
    };

    // Keep track of which inputs we've already matched so we don't double-fill
    const matchedDomIds = new Set();

    // Try to match each key in your profile to a field on the screen
    for (const [profileKey, searchTerm] of Object.entries(searchTerms)) {
        if (!userProfile[profileKey]) continue; // Skip if user didn't provide this data

        const results = fuse.search(searchTerm);
        
        // If we found a good match, and haven't used this input yet
        if (results.length > 0 && !matchedDomIds.has(results[0].item.domId)) {
            const bestMatch = results[0].item;
            
            // Map the profile key to the actual ID or fallback to our virtual ai_ref
            localMapping[profileKey] = bestMatch.selectorId ? `#${bestMatch.selectorId}` : bestMatch.domId;
            matchedDomIds.add(bestMatch.domId);
        }
    }

    // Filter out the elements we matched, leaving only the complex questions for the AI
    cleanElements.forEach(el => {
        if (!matchedDomIds.has(el.domId)) {
            unresolvedElements.push(el);
        }
    });

    return { localMapping, unresolvedElements };
}