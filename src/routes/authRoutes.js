import { readFileSync } from 'fs';
import { Router } from 'express';
import { google } from 'googleapis';
import  open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
import googleAuth from '../controllers/authController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const redirect_uri = 'http://localhost:3000/api/auth/oauth2callback';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentialsPath = path.join(__dirname, '../config/credentials.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));

const { client_secret, client_id } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly" ,
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"
];

const router = Router();

//SAMPLE GAUTH ENDPOINT
router.get('/gauth' , (res , req) =>{
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
    
      console.log('Authorize this app by visiting this url:', authUrl);
      open(authUrl);
    
    //   res.status(200).json({
    //     success: true,
    //     message: 'Authorization URL generated',
    //     url: authUrl
    //   });
})

router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  res.status(200).json({
    message : 'Authorization successful! You can close this window.',
    token : tokens
});

  // readInbox(oAuth2Client);
});

// async function readInbox(auth) {
//   const gmail = google.gmail({ version: 'v1', auth });
//   const res = await gmail.users.messages.list({
//     userId: 'me',
//     maxResults: 10,
//   });

//   const messages = res.data.messages || [];

//   for (const msg of messages) {
//     const message = await gmail.users.messages.get({
//       userId: 'me',
//       id: msg.id,
//     });

//     const headers = message.data.payload.headers;
//     const fromHeader = headers.find(h => h.name === 'From');
//     const match = fromHeader?.value?.match(/<(.+?)>/);

//     const email = match ? match[1] : fromHeader?.value;
//     console.log('📩 From:', email);
//   }

//   res.status(200).json({
//     success: true,
//     message: 'Inbox read successfully',
//     emails: messages
//   });
// }

//JWT AUTH ENDPOINTS
router.post('/google-login' , googleAuth);

router.get('/jwt-test' , authenticateUser , (req , res) =>{
  res.status(200).json({
    success: true,
    message: 'JWT authentication successful',
    user: req.user
  });
})

export default router;