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
        const response = await fetch('/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create post');
        window.location.href = '/admin';
    } catch (err) {
        console.error(err);
    }
});
function setCurrentDateTime() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    document.getElementById('dateTimeInput').value = local;
}
setCurrentDateTime();