import { Hono } from 'hono';
import { verify } from 'hono/jwt';

const notesRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		DIRECT_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

notesRoute.use('/*', async (c, next) => {
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

export default notesRoute;
