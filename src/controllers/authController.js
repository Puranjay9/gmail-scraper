import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const credentialsPath = path.join(__dirname, '../config/credentials.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));

const { client_id } = credentials.web;
const googleClient = new OAuth2Client(client_id);

const prisma = new PrismaClient();

const generateToken = (userId) => {
    return jwt.sign({ userId } , process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const verifyGoogleToken = async(token) =>{

    try{
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: client_id
        });
        return ticket.getPayload();
    }catch(error){
        console.error('Error verifying Google token:', error);
    }
}

const googleAuth = async (req, res) =>{

    try{
        const { token } = req.body;

    if(!token){
        return res.status(400).json({
            success: false,
            message: 'Token is required'
        });
    }

    const UserData = await verifyGoogleToken(token);

    if(!UserData){
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    const { sub: googleId, email, name, picture } = UserData;

    let user = await prisma.user.findUnique({
        where: { email }
    });

    if(user){
        if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            picture: picture || user.picture,
            name: name || user.name,
            isVerified: true,
          },
        });
      }
    }else{
        user = await prisma.user.create({
        data: {
          email,
          name,
          picture,
          googleId,
          provider: 'google',
          isVerified: true,
        },
      });
    }

    const jwtToken = generateToken(user.id);

    res.status(200).json({
        success: true,
        message: user.googleId ? 'Login successful' : 'Account created and logged in successfully',
        token: jwtToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture
        }
    });

    }catch(error){
        console.error('Google auth error:', error);
        res.status(500).json({
        success: false,
        message: error.message || 'Authentication failed',
    });
    }
}

export default googleAuth;