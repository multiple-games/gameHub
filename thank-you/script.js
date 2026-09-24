window.addEventListener('load', () => {
    // Thoda sa smooth delay (500ms) taaki skeleton animation clearly dikhe
    setTimeout(() => {
        const skeleton = document.getElementById('skeleton');
        const content = document.getElementById('content');

        // Skeleton chupayein aur Real Content dikhayein
        if (skeleton && content) {
            skeleton.classList.add('hidden');
            content.classList.remove('hidden');
        }
    }, 500);
});