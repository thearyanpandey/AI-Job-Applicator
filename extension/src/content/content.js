import Fuse from 'fuse.js';
import { KNOWN_SITES } from './known_sites';

console.log("AI Job Applicator: Eyes open");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type === "START_AUTOFILL"){
        startAutofill(request.userProfile).then(() => {
            sendResponse({status: "done"});
        });
    }

    if(request.type === 'GET_JOB_DESCRIPTION'){
        console.log("Popup asked for JD. Scraping now...")
        const jd = getJobDescription();
        sendResponse({jobDescription: jd});
    }

    return true;
});

async function startAutofill(userProfile) {
    const hostname = window.location.hostname;
    console.log(`Detecting platform: ${hostname}`);

    // --- TIER 1: ATS Database Match ---
    const siteKey = Object.keys(KNOWN_SITES).find(domain => hostname.includes(domain));
    const siteBlueprint = siteKey ? KNOWN_SITES[siteKey] : null;

    let localMapping = {};
    let customQuestionsForAI = [];

    if (siteBlueprint) {
        console.log(`🏎️ Known ATS detected: ${siteBlueprint.name}. Engaging Fast Lane.`);
        
        // 1. Solve the obvious fields instantly using exact CSS selectors
        for (const [profileKey, selector] of Object.entries(siteBlueprint.standardFields)) {
            const element = document.querySelector(selector);
            if (element && userProfile[profileKey]) {
                localMapping[profileKey] = selector; // Map it directly!
                element.classList.add("ai-handled-standard"); // Mark it so we don't scrape it later
            }
        }
        
        // 2. Scrape ONLY the remaining custom questions
        customQuestionsForAI = getATSQuestions(siteBlueprint);
    } else {
        console.log("🤖 Unknown ATS. Engaging Universal Scanner...");
        // 1. Grab all inputs from the page
        const allCleanElements = getUniversalDOM(); // (This is your old getSimplifiedDOM)
        
        // 2. Run the fuzzy matcher locally to solve obvious fields
        const fuzzyResults = performFuzzyMatching(allCleanElements, userProfile);
        localMapping = fuzzyResults.localMapping;
        customQuestionsForAI = fuzzyResults.unresolvedElements;
    }

    console.log("⚡ Standard Fields solved locally:", localMapping);
    console.log("❓ Custom Questions left for AI:", customQuestionsForAI);

    // If there are no custom questions left, fill what we have and exit
    if (customQuestionsForAI.length === 0) {
        console.log("🎯 No custom questions found. Filling standard fields...");
        fillForm(localMapping, userProfile);
        logJobApplication();
        return;
    }

    // --- TIER 3: AI Fallback for Custom Questions ---
    console.log("Sending custom questions to AI Backend...");
    const jobDescription = getJobDescription();

    chrome.runtime.sendMessage(
        { 
            type: "ANALYZE_PAGE_WITH_AI", 
            payload: {
                domSkeleton: customQuestionsForAI,
                jobDescription: jobDescription,
                userProfile: userProfile
            } 
        },
        (response) => {
            if (response && response.success && response.mapping) {
                console.log("✅ AI Identification complete:", response.mapping);
                
                // Combine our local matches with the AI's custom matches
                const finalMapping = { ...localMapping, ...response.mapping };
                fillForm(finalMapping, userProfile);
                logJobApplication();
            } else {
                console.error("AI failed. Filling what we know.");
                fillForm(localMapping, userProfile); 
                logJobApplication();
            }
        }
    );
}

function getATSQuestions(blueprint) {
    const cleanElements = [];
    const wrappers = document.querySelectorAll(blueprint.questionWrapper);
    
    let globalIndex = 0; // Use a continuous index for our virtual IDs

    wrappers.forEach((wrapper) => {
        // Find ALL inputs inside this wrapper (Fixes the Radio Button bug)
        const inputSelectors = ["input", "textarea", "select", "[role='combobox']", "[role='radiogroup']", "[role='listbox']"].join(", ");
        const inputs = wrapper.querySelectorAll(inputSelectors);
        
        inputs.forEach(input => {
            // Skip if we already handled it in the Fast Lane
            if (input.classList.contains("ai-handled-standard")) return;
            
            // Skip purely structural or hidden inputs
            if (input.type === 'file' || input.type === 'submit') return;
            if (input.type === 'hidden' && !input.parentElement.querySelector('button')) return;

            const style = window.getComputedStyle(input);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

            const labelText = getLabelText(input);
            if (!labelText) return;

            const refId = `ai_ref_${globalIndex}`;
            cleanElements.push({
                domId: refId,
                type: input.type || input.getAttribute('role') || input.tagName.toLowerCase(),
                label: labelText
            });
            
            // Add a dataset attribute to the HTML so we can easily find it later during the fill phase
            input.dataset.aiRef = refId; 
            globalIndex++;
        });
    });

    return cleanElements;
}

function getUniversalDOM() {
    
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
        if (!labelText) return;

        let inputType = el.type || el.getAttribute('role') || el.tagName.toLocaleLowerCase();
        el.dataset.aiRef = `ai_ref_${index}`;
        
        cleanElements.push({
            domId: `ai_ref_${index}`,
            type: inputType,
            label: labelText, // Clean up weird line breaks
            elementReference: el // We keep this to focus/fill it later
        });
    });

    return cleanElements;
}

// Ensure your getLabelText function from before is still here!
function getLabelText(element) {
    let labelText = "";
    let optionText = ""; // For radio/checkboxes 

    if (element.type === 'radio' || element.type === 'checkbox'){
        const parentLabel = element.closest("label");
        if(parentLabel){
            const clone = parentLabel.cloneNode(true);
            const inputInside = clone.querySelector('input');
            if(inputInside) clone.removeChild(inputInside);
            optionText = clone.innerText.trim();
        }
    }

    // Method 1: The standard 'for' attribute (Works perfectly for the Greenhouse HTML)
    if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) {
            labelText = label.innerText;
        }
    }

    // Method 2: Wrapped inside a <label> (Common in older sites)
    if (!labelText) {
        const questionContainer = element.closest('.application-question, .field-wrapper');
        if (questionContainer) {
           const labelDiv = questionContainer.querySelector('.application-label, .label, .text');
            if (labelDiv) {
                labelText = labelDiv.innerText;
            }
        }
    }

    // Method 3: Fallbacks (aria-label, placeholder, name)
    if (!labelText) {
        labelText = element.getAttribute('aria-label') || element.placeholder || element.name || "";
    }

    // Clean up text
    let finalLabel = labelText.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').replace(/\*/g, '').trim();

    // If this is a radio/checkbox, combine the question with the option
    // e.g., "Are you authorized? (Option: Yes)"
    if (optionText && finalLabel !== optionText) {
        finalLabel = `${finalLabel} (Option: ${optionText})`;
    }

    return finalLabel;
}

function getJobDescription() {
    try {
        // A heuristic approach: find containers that likely hold the job description
        const selectors = [
            '#job-description', '.job-description', '[data-ui="job-description"]',
            '.posting-requirements', '.description', 'article'
        ];
        
        let targetDoc = document;
        
        // If we are in an iframe, try to look at the parent document (may be blocked by CORS)
        if (window.self !== window.top) {
            try {
                if (window.parent.document) {
                    targetDoc = window.parent.document;
                }
            } catch (e) {
                console.log("CORS blocked reading parent window for JD. Falling back to local iframe text.");
            }
        }

        for (const selector of selectors) {
            const el = targetDoc.querySelector(selector);
            if (el && el.innerText.length > 200) {
                return el.innerText.substring(0, 3000); 
            }
        }
        
        return targetDoc.body.innerText.substring(0, 3000); 
    } catch (e) {
        console.log("Could not extract Job Description", e);
        return "Job description not available due to iframe restrictions.";
    }
}

async function fillForm(mapping, userProfile) {
    console.log("✍️ Filling form with mapping:", mapping);

    for (const [key, value] of Object.entries(mapping)) {
        let textToFill = "";
        let selector = "";

        if (userProfile[key]) {
            textToFill = userProfile[key];
            selector = value; 
        } else {
            textToFill = value; 
            selector = key; 
        }

        if (key === 'full_name' && !userProfile.full_name) {
             textToFill = `${userProfile.first_name} ${userProfile.last_name}`;
        }

        if (!textToFill) continue;

        let element = document.querySelector(selector) || document.getElementById(selector);
        
        if (!element && selector.startsWith('ai_ref_')) {
            element = document.querySelector(`[data-ai-ref="${selector}"]`);
        }

        // Safely check if element exists
        if (!element) {
            console.log(`Could not find element in DOM for selector: ${selector}`);
            continue; 
        }

        if(element.type === 'file'){
            console.log(`Skipping file input for ${key}`);
            continue;
        }

        // === THE INJECTION LOGIC ===
        element.focus();

        const sibilingButtons = element.parentElement.querySelectorAll('button');
        if(sibilingButtons.length > 0 && (element.type === 'checkbox' || element.type === 'hidden')){
            console.log("Detected button group, attempting to click the correct option...");
            let clicked = false;
            for(const btn of sibilingButtons){
                if (btn.innerText.toLowerCase().trim() === String(textToFill).toLowerCase().trim() ||
                   (String(textToFill).toLowerCase() === 'true' && btn.innerText.toLowerCase() === 'yes') ||
                   (String(textToFill).toLowerCase() === 'false' && btn.innerText.toLowerCase() === 'no')) {
                    btn.click();
                    clicked = true;
                    break;
                }
            }
            if(clicked){
                element.blur();
                continue;
            }
        }

        // Handle React Comboboxes (The New Boss)
        if (element.getAttribute('role') === 'combobox') {
            await fillReactDropdown(element, textToFill);
        }
        // Handle Checkboxes and Radio Buttons
        else if (element.type === 'radio' || element.type === 'checkbox') {
            if (textToFill === true || textToFill === "true" || textToFill === element.value) {
                element.checked = true;
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        } 
        // Handle standard text inputs, textareas, and standard <select> tags
        else {
            element.value = textToFill;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        element.blur();
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

async function fillReactDropdown(comboboxElement, textToFill) {
    console.log(`Simulating human interaction for dropdown: `, textToFill);

    //Find the actual hidden input inside the combobox wrapper
    const input = comboboxElement.querySelector('input') || comboboxElement;

    //click the combobox to open the menu
    comboboxElement.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    input.focus();

    // 3. The React Value Setter Hack
    // React overrides standard input setters. We have to bypass React's wrapper 
    // and talk directly to the browser's native value setter.
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    if(nativeInputValueSetter){
        nativeInputValueSetter.call(input, textToFill);
    }else{
        input.value = textToFill;
    }

    //tell react that a user just typed smthg 
    input.dispatchEvent(new Event('input', {bubbles: true}));

    //wait for react to render 
    await new Promise(resolve => setTimeout(resolve, 300));

    //Find the rendered menu option
    const options = document.querySelectorAll('[role="option"]');
    let matchedOption = null;

    //Look for the exact text match
    for (const option of options) {
        if (option.innerText.toLowerCase().trim() === textToFill.toLowerCase().trim() ||
            option.innerText.toLowerCase().includes(textToFill.toLowerCase())) {
            matchedOption = option;
            break;
        }
    }

    //Click the matching options, or hit enter as a fallback
    if(matchedOption){
        matchedOption.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }else{
        input.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: 'Enter', keyCode:13}));

    }

    input.blur();
}

//JOB tracking functions 
function logJobApplication(){
    const url = window.location.href;

    //Page titles on job boards are usualy "Role at company"
    let pageTitle = document.title || "Unknow Job";

    //clean up annoying things: SDE 2 -> SDE
    pageTitle = pageTitle.replace(/^\(\d+\)\s*/, '');

    const newJob = {
        id: Date.now().toString(),
        roleAndCompany: pageTitle,
        url: url,
        dateApplied: new Date().toLocaleDateString(),
        status: "Applied"
    };

    //Fetch existing jobs 
    chrome.storage.local.get(['applied_jobs'], (result) => {
        const jobs = result.applied_jobs || []; 

        const alreadyTracked = jobs.some(job => job.url.split('?')[0] === url.split('?')[0]);

        if(!alreadyTracked){
            jobs.push(newJob);
            chrome.storage.local.set({'applied_jobs': jobs}, () => {
                console.log("Job Auto-Tracked:", newJob);
            });
        } else{
            console.log("Job already tracked for this URL.")
        }
    })
}