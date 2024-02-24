import { Context, Env, Hono } from 'hono';
import { Prisma, PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const app = new Hono<Enviroment>();

type Enviroment = {
	Bindings: {
		DATABASE_URL: string;
	};
	Variables: {
		prisma: PrismaClient;
	};
};

app.use('*', async (c, next) => {
	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: String(c.env.DATABASE_URL),
			},
		},
	}).$extends(withAccelerate());
	// c.set('prisma', prisma);
	await next();
});

app.get('/', async (c) => {
	// const count = c.get('prisma').user.count();
	return c.text('hi');
});

// app.post('/post', async (c) => {
// 	// DOUBT do i need to write the below this everytime?
// 	const { DIRECT_URL } = env<{ DIRECT_URL: string }>(c);
// 	const prisma = new PrismaClient({
// 		datasourceUrl: DIRECT_URL,
// 	}).$extends(withAccelerate());
// });
export default app;
