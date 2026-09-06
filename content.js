async function getSettings() {
    return await chrome.storage.sync.get({
        blockedUsers: [],
        blockedWords: []
    });
}

async function processComments() {

    const settings = await getSettings();

    const {
        blockedUsers,
        blockedWords
    } = settings;

    // 通常コメント
    document
        .querySelectorAll("ytd-comment-thread-renderer")
        .forEach(comment => {

            if (comment.dataset.blocked) {
                return;
            }

            const author =
                comment.querySelector("#author-text");

            const text =
                comment.querySelector("#content-text");

            const authorName =
                author?.textContent.trim() || "";

            const commentText =
                text?.textContent || "";

            let blocked = false;

            // ユーザーブロック
            if (
                blockedUsers.includes(authorName)
            ) {
                blocked = true;
            }

            // NGワードブロック
            if (
                blockedWords.some(word =>
                    commentText.includes(word)
                )
            ) {
                blocked = true;
            }

            if (blocked) {

                comment.style.display = "none";

                comment.dataset.blocked = "true";
            }

        });

    // ライブチャット
    document
        .querySelectorAll(
            "yt-live-chat-text-message-renderer"
        )
        .forEach(chat => {

            if (chat.dataset.blocked) {
                return;
            }

            const author =
                chat.querySelector("#author-name");

            const message =
                chat.querySelector("#message");

            const name =
                author?.textContent.trim() || "";

            const text =
                message?.textContent || "";

            let blocked = false;

            if (
                blockedUsers.includes(name)
            ) {
                blocked = true;
            }

            if (
                blockedWords.some(word =>
                    text.includes(word)
                )
            ) {
                blocked = true;
            }

            if (blocked) {

                chat.style.display = "none";

                chat.dataset.blocked = "true";
            }

        });

}

processComments();

new MutationObserver(() => {

    processComments();

}).observe(document.body, {
    childList: true,
    subtree: true
});

chrome.storage.onChanged.addListener(() => {
    processComments();
});
