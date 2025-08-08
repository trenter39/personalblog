import db from '../config/db.js';

export async function fetchPost(id) {
    let sql = "select * from posts where id = ?";
    const [result] = await db.query(sql, [id]);
    if (result.length === 0) return null;
    return result.map(post => ({
        ...post,
        tags: post.tags ? post.tags.split(',') : []
    }))[0];
}

export async function getPost(req, res) {
    try {
        const id = parseInt(req.params.postID);
        if (isNaN(id)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const post = await fetchPost(id);
        if (!post) return res.status(404).send("Post wasn't found!");
        res.status(200).json(post);
    } catch (err) {
        console.log(err);
        return res.status(500)
            .send("Error retrieving post!");
    }
}

export async function fetchPosts() {
    let sql = "select * from posts";
    const [result] = await db.query(sql);
    return result.map(post => ({
        ...post,
        tags: post.tags ? post.tags.split(',') : []
    }));
}

export async function getPosts(req, res) {
    try {
        const posts = await fetchPosts();
        res.status(200).json(posts);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Error retrieving posts.");
    }
}

export async function getPostsTerm(req, res) {
    try {
        const searchTerm = req.query.term;
        const likeTerm = `%${searchTerm}%`;
        const sql = `select * from posts
        where title like ? or content like ?
        or category like ? or tags like ?`;
        const values = [likeTerm, likeTerm,
            likeTerm, likeTerm];
        const [result] = await db.query(sql, values);
        const formatted = result.map(post => ({
            ...post,
            tags: post.tags ? post.tags.split(',') : []
        }));
        return res.status(200).json(formatted);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}

export async function createPost(req, res) {
    try {
        const { title, content, category, tags } = req.body;
        if (!title || !content
            || !category || !Array.isArray(tags)) {
            return res.status(400)
                .send("Missing fields or invalid format!");
        }
        const now = new Date();
        let createdAt = req.body.date ? req.body.date : now.toISOString();
        let updatedAt = now.toISOString();
        let tagString = tags.join(',');
        const createsql = `insert into posts(title, content,
        category, tags, createdAt, updatedAt) 
        values (?, ?, ?, ?, ?, ?)`;
        let values = [title, content, category,
            tagString, createdAt, updatedAt];
        const [result] = await db.query(createsql, values);
        const createdPost = {
            id: result.insertId,
            title,
            content,
            category,
            tags,
            createdAt,
            updatedAt
        };
        return res.status(201).json(createdPost);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}

export async function changePost(req, res) {
    try {
        const id = parseInt(req.params.postID);
        if (isNaN(id)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const { title, content, category, tags } = req.body;
        if (!title || !content
            || !category || !Array.isArray(tags)) {
            return res.status(400)
                .send("PUT request missing required fields!");
        }
        const selectsql = "select * from posts where id = ?";
        const [selectResult] = await db.query(selectsql, [id]);
        if (selectResult.length === 0) {
            return res.status(404).send("Post wasn't found!");
        }
        const now = new Date();
        const createdAt = selectResult[0].createdAt;
        const updatedAt = now.toISOString();
        const tagString = tags.join(',');
        const updatesql = `update posts set title = ?,
        content = ?, category = ?, tags = ?,
        updatedAt = ? where id = ?`;
        const values = [title, content, category,
            tagString, updatedAt, id];
        await db.query(updatesql, values);
        const updatedPost = {
            id: id,
            title,
            content,
            category,
            tags,
            createdAt,
            updatedAt
        }
        return res.status(200).json(updatedPost);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}


export async function updatePost(req, res) {
    try {
        const id = parseInt(req.params.postID);
        if (isNaN(id)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        let { title, content, category, tags } = req.body;
        const selectsql = "select * from posts where id = ?";
        const [selectResult] = await db.query(selectsql, [id]);
        if (selectResult.length === 0) {
            return res.status(404)
                .send("Post wasn't found!");
        }
        const initPost = selectResult[0];
        const updatedTitle = title !== undefined ?
            title : initPost.title;
        const updatedContent = content !== undefined ?
            content : initPost.content;
        const updatedCategory = category !== undefined ?
            category : initPost.category;
        const updatedTags = tags !== undefined ?
            tags.join(',') : initPost.tags;
        const updatedAt = new Date().toISOString();
        const updatesql = `update posts set title = ?,
        content = ?, category = ?, tags = ?,
        updatedAt = ? where id = ?`;
        const values = [updatedTitle, updatedContent,
            updatedCategory, updatedTags, updatedAt, id];
        await db.query(updatesql, values);
        const updatedPost = {
            id,
            title: updatedTitle,
            content: updatedContent,
            category: updatedCategory,
            tags: tags || initPost.tags.split(','),
            createdAt: initPost.createdAt,
            updatedAt
        };
        return res.status(200).json(updatedPost);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}

export async function deletePost(req, res) {
    try {
        const id = req.params.postID;
        if (isNaN(id)) {
            return res.status(400)
                .send("Bad request. Invalid ID.");
        }
        const checksql = "select 1 from posts where id = ?";
        const [result] = await db.query(checksql, [id]);
        if (result.length === 0) {
            return res.status(404).send("Post wasn't found!");
        }
        const deletesql = "delete from posts where id = ?";
        await db.query(deletesql, [id]);
        return res.status(204).send();
    } catch (err) {
        console.log(err);
        return res.status(500).send("Database error!");
    }
}