document.getElementById('inputs').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    data.date = new Date(data.date).toISOString();
    data.tags = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    try {
        const id = data.id;
        const response = await fetch(`/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create post');
        window.location.href = '/admin';
    } catch (err) {
        console.error(err);
    }
});