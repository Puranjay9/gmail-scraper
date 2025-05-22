import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authenticateUser = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        req.userId = user.id;
        req.user = user;
    
        next();

    }catch(error){
        console.error('Error in authentication middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

export default authenticateUser;