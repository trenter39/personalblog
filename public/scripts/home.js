const sortSelect = document.getElementById('sortSelect');
const postList = document.getElementById('postList');

sortSelect.addEventListener("change", () => {
    const posts = Array.from(postList.querySelectorAll('.post'));
    posts.sort((a, b) => {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);

        return sortSelect.value === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    posts.forEach(post => postList.appendChild(post));
});