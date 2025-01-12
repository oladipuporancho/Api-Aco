const bcrypt = require('bcryptjs');

const password = 'Ayomide01'; // This is the plain password you want to hash

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;
  console.log('Hashed Password:', hashedPassword); // This is the password you will store in your .env
});
