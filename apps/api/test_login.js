const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with: admin@hostel.com / password123');
    const response = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@hostel.com',
      password: 'password123'
    });
    console.log('Login Success (Status ' + response.status + '):');
    console.log('User Role:', response.data.user.role);
    console.log('Full Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('Login Failed (Status ' + error.response.status + '):');
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
      if (error.response.data.details) {
        console.log('Validation Details:', JSON.stringify(error.response.data.details, null, 2));
      }
    } else {
      console.log('Error:', error.message);
      if (error.stack) console.log('Stack:', error.stack);
    }
  }
}

testLogin();
