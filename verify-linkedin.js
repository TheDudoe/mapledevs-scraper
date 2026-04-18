require('dotenv').config();
const axios = require('axios');

const token = process.env.LINKEDIN_ACCESS_TOKEN;

async function checkMe() {
    if (!token) {
        console.error('❌ Error: LINKEDIN_ACCESS_TOKEN is not set in your environment.');
        return;
    }

    try {
        const response = await axios.get('https://api.linkedin.com/v2/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('\n✅ Token is VALID!');
        console.log('--- YOUR DETAILS ---');
        console.log(`Name: ${response.data.localizedFirstName} ${response.data.localizedLastName}`);
        console.log(`Your AUTHOR URN: urn:li:person:${response.data.id}`);
        console.log('\n👉 Copy the code above (including urn:li:person:) and update your GitHub Actions secret LINKEDIN_PERSON_URN.');
    } catch (error) {
        console.error('❌ Error fetching your profile:', error.response ? JSON.stringify(error.response.data) : error.message);
        if (error.response && error.response.status === 401) {
            console.error('💡 Your token might have expired or is incorrect.');
        }
    }
}

checkMe();
