
import axios from 'axios';

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/login/student', {
            name: 'Shwetha S',
            rollNo: '24uam151'
        });
        console.log('Login Response:', response.data);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
