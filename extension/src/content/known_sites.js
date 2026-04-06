// known_sites.js

export const KNOWN_SITES = {
    // Matches standard Greenhouse forms AND embedded iframes (like MongoDB)
    "greenhouse.io": {
        name: "Greenhouse",
        formSelector: "form#application-form",
        questionWrapper: ".field-wrapper", // Only look for questions inside these divs
        standardFields: {
            first_name: "#first_name",
            last_name: "#last_name",
            email: "#email",
            phone: "#phone",
            linkedin: "input[autocomplete='url'], input[aria-label*='LinkedIn']"
        }
    },
    // Matches Lever forms
    "lever.co": {
        name: "Lever",
        formSelector: "form#application-form",
        questionWrapper: ".application-question",
        standardFields: {
            full_name: "input[name='name']", // Lever uses a single full name field
            email: "input[name='email']",
            phone: "input[name='phone']",
            org: "input[name='org']",
            linkedin: "input[name='urls[LinkedIn]']",
            portfolio: "input[name='urls[Portfolio]'], input[name='urls[Other]']"
        }
    },

    "ashbyhq.com": {
        name: "Ashby",
        formSelector: ".ashby-application-form-container",
        questionWrapper: ".ashby-application-form-field-entry",
        standardFields: {
            full_name: "input[name='_systemfield_name']",
            email: "input[name='_systemfield_email']",
            phone: "input[name='_systemfield_phone']",
            linkedin: "input[name='_systemfield_linkedin']" // Sometimes used, otherwise falls to AI
        }
    }
};