const axios = require('axios'); axios.get('http://localhost:5000/api/services').then(res => console.log(res.data)).catch(err => console.error(err));
