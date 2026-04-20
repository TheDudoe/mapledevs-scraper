const axios = require('axios');
const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSkt2ROoihRVsL4f0m4dXZ1IzD7KYzEghgOwW7QPC2EN6sE4D_iI3stfllfdeq61coOrhdi47eeLmoY/pub?output=csv';

async function getRealId() {
    try {
        const res = await axios.get(url);
        // Sometimes the redirect URL contains the real ID
        console.log('Final URL:', res.request.res.responseUrl);
        
        // Check for other interesting headers
        console.log('Headers:', res.headers);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
getRealId();
