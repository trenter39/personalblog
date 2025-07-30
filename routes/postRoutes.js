import express from 'express';
import {
    getPosts, getPost, getPostsTerm, createPost,
    changePost, updatePost, deletePost
} from '../controllers/postController.js';

const router = express.Router();

router.get('/', (req, res) => req.query.term ? getPostsTerm(req, res) : getPosts(req, res));
router.get('/:id', getPost);
router.post('/', createPost);
router.put('/:id', changePost);
router.patch('/:id', updatePost);
router.delete('/:id', deletePost);

export default router;