import { Hono } from 'hono';
import auth from './auth';
import user from './user';
import notes from './notes';
const app = new Hono<{
	Bindings: {
		DATABASE_URL: string;
		DIRECT_URL: string;
		JWT_SECRET: string;
	};
	Variables: {
		userId: string;
	};
}>();

// Routes
app.route('/v1/auth', auth);
app.route('/v1/user', user);
app.route('/v1/notes', notes);

app.get('/', async (c) => {
	return c.json({ message: 'app is healthy ' });
});
export default app;
