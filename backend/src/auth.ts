import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { decode, jwt, sign, verify } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';

const authRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		DIRECT_URL: string;
		JWT_SECRET: string;
	};
}>();

authRoute.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	console.log(body);
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				username: body.username,
				password: body.password,
			},
		});
		c.status(200);
		return c.json({ sucess: `sucessfully added new user ${user.username} with id : ${user.id}` });
	} catch (e) {
		c.status(400);
		return c.json({ error: e, message: 'email already exist' });
	}
});
//
authRoute.post('/signin', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();

	try {
		const user = await prisma.user.findUnique({
			where: {
				email: body.email,
			},
		});
		if (!user) {
			return c.json({ message: 'User not found' }, { status: 404 });
		}
		const passwordValid = user.password === body.password;
		if (!passwordValid) {
			return c.json({ message: 'Incorrect password' }, { status: 401 });
		}
		console.log(user.id);
		const token = await sign({ userId: user.id }, c.env.JWT_SECRET);
		return c.json({ token, user: user.id });
	} catch (e) {
		return c.json({ message: 'User cannot be logged in ', error: e }, { status: 500 });
	}
});

export default authRoute;
