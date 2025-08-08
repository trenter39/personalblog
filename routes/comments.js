import express from 'express';
import {
    getComments, getComment, createComment,
    changeComment, updateComment, deleteComment
} from '../controllers/comments.js';

const router = express.Router({mergeParams: true});

router.get('/', getComments);
router.get('/:commentID', getComment);
router.post('/', createComment);
router.put('/:commentID', changeComment);
router.patch('/:commentID', updateComment);
router.delete('/:commentID', deleteComment);

export default router;