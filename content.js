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

    document
        .querySelectorAll("ytd-comment-thread-renderer")
        .forEach(comment => {

            const author =
                comment.querySelector("#author-text");

            if (!author) {
                return;
            }

            // ブロックアイコン追加
            if (
                !comment.querySelector(".ytcb-block-btn")
            ) {

                const button =
                    document.createElement("span");

                button.className =
                    "ytcb-block-btn";

                button.textContent =
                    "🚫";

                button.title =
                    "このユーザーをブロック";

                button.addEventListener(
                    "click",
                    async event => {

                        event.preventDefault();
                        event.stopPropagation();

                        const userName =
                            author.textContent.trim();

                        const data =
                            await chrome.storage.sync.get({
                                blockedUsers: []
                            });

                        if (
                            !data.blockedUsers.includes(
                                userName
                            )
                        ) {

                            data.blockedUsers.push(
                                userName
                            );

                            await chrome.storage.sync.set({
                                blockedUsers:
                                    data.blockedUsers
                            });

                        }

                        comment.style.display =
                            "none";

                        comment.dataset.blocked =
                            "true";

                    }
                );

                author.insertAdjacentElement(
                    "afterend",
                    button
                );
            }

            if (comment.dataset.blocked) {
                return;
            }

            const text =
                comment.querySelector(
                    "#content-text"
                );

            const authorName =
                author.textContent.trim();

            const commentText =
                text?.textContent || "";

            let blocked = false;

            // ユーザーブロック
            if (
                blockedUsers.includes(
                    authorName
                )
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

                comment.style.display =
                    "none";

                comment.dataset.blocked =
                    "true";
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
                chat.querySelector(
                    "#author-name"
                );

            const message =
                chat.querySelector(
                    "#message"
                );

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

                chat.style.display =
                    "none";

                chat.dataset.blocked =
                    "true";
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
