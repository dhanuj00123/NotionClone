import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono';
import { verify } from 'hono/jwt';

const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		DIRECT_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

userRouter.use('/*', async (c, next) => {
	const authToken = c.req.header('Authorization');
	if (!authToken) {
		c.status(401);
		return c.json({ error: 'Unauthorized !' });
	}

	const token = authToken.split(' ')[1];
	try {
		const payload = await verify(token, c.env.JWT_SECRET);
		if (!payload || !payload.userId) {
			c.status(401);
			return c.json({ error: 'Unauthorized' });
		}
		// Set userId in context for future middleware or route handlers
		c.set('userId', payload.userId);
	} catch (error) {
		console.error('Error verifying JWT token:', error);
		c.status(401);
		return c.json({ error: 'Unauthorized' });
	}

	// Call the next middleware
	await next();
});

userRouter.get('/profile', async (c, next) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const userId = c.get('userId');
	try {
		const userDetails = await prisma.user.findFirst({
			where: {
				id: Number(userId),
			},
		});
		return c.json({ userId: userId, userName: userDetails?.username, userEmail: userDetails?.email, createdAt: userDetails?.createdAt });
	} catch (e) {
		c.status(401);
		return c.json({ error: 'error while retriving userDetails' });
	}
});

userRouter.put('/profile', async (c, next) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	const userId = c.get('userId');
	try {
		const user = await prisma.user.update({
			where: {
				id: Number(userId),
			},
			data: { username: body?.username, email: body?.email },
		});
		return c.json({ sucsess: 'Sucessfully updated User' });
	} catch (e) {
		c.status(401);
		return c.json({ error: 'error while retriving userDetails' });
	}
});

export default userRouter;
