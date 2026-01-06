const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer();

const app = express();
app.use(bodyParser.json());

const PORT = 5190;
const JWT_KEY = 'THIS_IS_A_VERY_SECRET_KEY_12345_1234567890';

const users = new Map();

function generateToken(user) {
  const payload = {
    unique_name: user.Email,
    FullName: user.FullName,
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': user.Role,
    role: user.Role,
  };
  return jwt.sign(payload, JWT_KEY, { issuer: 'RecruitmentSystem', audience: 'RecruitmentSystemUsers', expiresIn: '1h', algorithm: 'HS256' });
}

app.post('/api/auth/register', (req, res) => {
  const { FullName, Email, Password, Role } = req.body;
  if (users.has(Email)) return res.status(400).json({ message: 'User already exists' });
  const user = { FullName, Email, Password, Role };
  users.set(Email, user);
  const token = generateToken(user);
  res.json({ token });
});

app.post('/api/auth/login', (req, res) => {
  const { Email, Password } = req.body;
  const user = users.get(Email);
  if (!user || user.Password !== Password) return res.status(401).json({ message: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ token });
});

app.get('/api/candidates/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  try {
    const p = jwt.verify(token, JWT_KEY, { issuer: 'RecruitmentSystem', audience: 'RecruitmentSystemUsers' });
    const user = users.get(p.unique_name);
    return res.json({ email: user.Email, fullName: user.FullName, roles: [user.Role] });
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/api/candidates/me/interviews', (req, res) => {
  res.json([{ id: 1, date: new Date().toISOString(), interviewer: 'Jane Doe', status: 'Scheduled' }]);
});

app.get('/api/candidates/me/offers', (req, res) => {
  res.json([{ id: 1, jobTitle: 'Software Engineer', salary: '$120k' }]);
});

app.get('/api/candidates/me/status-history', (req, res) => {
  res.json([{ id: 1, status: 'Applied', date: new Date().toISOString() }]);
});

app.post('/api/candidates/me/documents', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  res.json({ id: 1, fileName: req.file.originalname, contentType: req.file.mimetype, url: '/uploads/' + req.file.originalname });
});

app.get('/swagger/index.html', (req, res) => {
  res.send('<html><body>Mock Swagger</body></html>');
});

app.listen(PORT, () => console.log(`Mock server listening on port ${PORT}`));