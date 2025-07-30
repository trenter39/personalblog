import expressHandlebars from 'express-handlebars';
import express from 'express';
import path, { format } from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from './config/auth.js';
import { PORT } from './config/conf.js';
import postsRouter from './routes/postRoutes.js';
import { fetchPost, fetchPosts } from './controllers/postController.js';

const handlebars = expressHandlebars.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: {
        formatDateInput: function (dateString) {
            return new Date(dateString).toISOString().slice(0, 16);
        }
    }
});

const app = express();
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded());
app.use('/posts', postsRouter);
app.use(express.static('public'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/admin', authMiddleware, async (req, res) => {
    try {
        const posts = (await fetchPosts()).map(post => ({
            ...post,
            createdAt: formatDate(post.createdAt)
        }));
        res.render('admin', {
            title: 'Admin Home',
            script: '<script src="/scripts/admin.js"></script>',
            posts
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error loading posts!")
    }
});

app.get('/post/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await fetchPost(id);
        console.log(post);
        post.createdAt = formatDate(post.createdAt);
        console.log(post.createdAt);
        res.render('post', {
            title: `${post.title}`,
            post
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching post!");
    }
});

app.get('/home', async (req, res) => {
    try {
        const posts = (await fetchPosts()).map(post => ({
            ...post,
            createdAt: formatDate(post.createdAt)
        }));
        res.render('home', {
            title: 'Home',
            posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading posts!");
    }
});

app.get('/new', authMiddleware,(req, res) => {
    res.render('new', {
        title: 'Create Post',
        script: '<script src="/scripts/create.js"></script>',
    });
});

app.get('/update/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const post = await fetchPost(id);
        res.render('update', {
            title: 'Update Post',
            script: '<script src="/scripts/update.js"></script>',
            post
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading post to update!");
    }
});

app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}/home`);
});

function formatDate(ISOString) {
    const date = new Date(ISOString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return date.toLocaleDateString('en-US', options);
}