import db from '../config/db.js';

export async function fetchComments(postID) {
    const sql = `select * from comments
        where postID = ?`;
    const [result] = await db.query(sql, [postID]);
    if (result.length === 0) return null;
    return result;
}

export async function getComment(req, res) {
    try {
        const postID = parseInt(req.params.postID);
        const commentID = parseInt(req.params.commentID);
        if (isNaN(postID) || isNaN(commentID)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const sql = `select * from comments
        where postID = ? and id = ?`;
        const [result] = await db
            .query(sql, [postID, commentID]);
        if (result.length === 0) {
            return res.status(404)
                .send("Comment wasn't found!");
        }
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(500)
            .send("Error retrieving comment!");
    }
}

export async function getComments(req, res) {
    try {
        const postID = parseInt(req.params.postID);
        if (isNaN(postID)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const comments = await fetchComments(postID);
        if (!comments) return res.status(404).send("Comments weren't found!");
        res.status(200).json(comments);
    } catch (err) {
        console.log(err);
        return res.status(500)
            .send("Error retrieving comments!");
    }
}

export async function createComment(req, res) {
    try {
        const postID = parseInt(req.params.postID);
        if (isNaN(postID)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const { author, content } = req.body;
        if (!author || !content) {
            return res.status(400)
                .send("Missing fields or invalid format!");
        }
        const checksql = `select 1 from posts
        where id = ?`;
        const [checkResult] = await db
            .query(checksql, [postID]);
        if (checkResult.length === 0) {
            return res.status(404).send("Post wasn't found!");
        }
        const now = new Date();
        const createdAt = now.toISOString();
        const updatedAt = now.toISOString();
        const createsql = `insert into comments(postID, author,
        content, createdAt, updatedAt)
        values(?, ?, ?, ?, ?)`;
        const values = [postID, author, content,
            createdAt, updatedAt];
        const [result] = await db.query(createsql, values);
        const createdComment = {
            id: result.insertId,
            postID,
            author,
            content,
            createdAt,
            updatedAt
        };
        return res.status(201).json(createdComment);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}

export async function changeComment(req, res) {
    try {
        const postID = parseInt(req.params.postID);
        const commentID = parseInt(req.params.commentID);
        if (isNaN(postID) || isNaN(commentID)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const { author, content } = req.body;
        if (!author || !content) {
            return res.status(400)
                .send("PUT request missing required fields!");
        }
        const selectsql = `select * from comments
        where id = ?`;
        const [selectResult] = await db
            .query(selectsql, [commentID]);
        if (selectResult.length === 0) {
            return res.status(404)
                .send("Comment wasn't found!");
        }
        const currentComment = selectResult[0];
        if (currentComment.postID !== postID) {
            return res.status(400).send(
                "Comment doesn't belong to the specified post!");
        }
        const now = new Date();
        const createdAt = currentComment.createdAt;
        const updatedAt = now.toISOString();
        const updatesql = `update comments set author = ?,
        content = ?, updatedAt = ? where id = ?`;
        const values = [author, content, updatedAt, commentID];
        await db.query(updatesql, values);
        const updatedComment = {
            id: commentID,
            postID,
            author,
            content,
            createdAt,
            updatedAt
        }
        return res.status(200).json(updatedComment);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}

export async function updateComment(req, res) {
    try {
        const postID = parseInt(req.params.postID);
        const commentID = parseInt(req.params.commentID);
        if (isNaN(postID) || isNaN(commentID)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const { author, content } = req.body;
        if (author === undefined && content === undefined) {
            return res.status(400).send(
                "PATCH request must contain at least one field!");
        }
        const selectsql = "select * from comments where id = ?";
        const [selectResult] = await db
            .query(selectsql, [commentID]);
        if (selectResult.length === 0) {
            return res.status(404)
                .send("Comment wasn't found!");
        }
        const currentComment = selectResult[0];
        if (currentComment.postID !== postID) {
            return res.status(400).send(
                "Comment doesn't belong to the specified post!");
        }
        const updatedAuthor = author !== undefined ?
            author : currentComment.author;
        const updatedContent = content !== undefined ?
            content : currentComment.content;
        const updatedAt = new Date().toISOString();
        const updatesql = `update comments set author = ?,
        content = ?, updatedAt = ? where id = ?`;
        const values = [updatedAuthor, updatedContent,
            updatedAt, commentID];
        await db.query(updatesql, values);
        const updatedComment = {
            id: commentID,
            postID,
            author: updatedAuthor,
            content: updatedContent,
            createdAt: currentComment.createdAt,
            updatedAt
        }
        return res.status(200).json(updatedComment);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}

export async function deleteComment(req, res) {
    try {
        const postID = parseInt(req.params.postID);
        const commentID = parseInt(req.params.commentID);
        if (isNaN(postID) || isNaN(commentID)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const checksql = `select postID from comments
        where id = ?`;
        const [checkResult] = await db
            .query(checksql, [commentID]);
        if (checkResult.length === 0) {
            return res.status(404).send("Comment wasn't found!");
        }
        if (checkResult[0].postID !== postID) {
            return res.status(400).send(
                "Comment doesn't belong to the specified post!");
        }
        const deletesql = "delete from comments where id = ?";
        await db.query(deletesql, [commentID]);
        return res.status(204).send();
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}