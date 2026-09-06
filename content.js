let currentSettings = {
    blockedUsers: [],
    blockedWords: []
};

let processing = false;
let processRequested = false;

/**
 * Chrome Sync Storageから設定を取得する
 */
async function loadSettings() {
    currentSettings = await chrome.storage.sync.get({
        blockedUsers: [],
        blockedWords: []
    });
}

/**
 * 空文字を除去して比較用リストを作る
 */
function normalizeList(list) {
    return list
        .filter(item => typeof item === "string")
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

/**
 * ユーザーまたはNGワードに一致するか判定する
 */
function shouldBlock(authorName, commentText) {
    const blockedUsers =
        normalizeList(currentSettings.blockedUsers);

    const blockedWords =
        normalizeList(currentSettings.blockedWords);

    const userBlocked =
        blockedUsers.includes(authorName.trim());

    const wordBlocked =
        blockedWords.some(word =>
            commentText.includes(word)
        );

    return userBlocked || wordBlocked;
}

/**
 * 拡張機能によってコメントを非表示にする
 */
function hideElement(element) {
    if (element.dataset.ytcbBlocked === "true") {
        return;
    }

    element.dataset.ytcbBlocked = "true";
    element.style.display = "none";
}

/**
 * ブロック解除時にコメントを再表示する
 */
function showElement(element) {
    if (element.dataset.ytcbBlocked !== "true") {
        return;
    }

    delete element.dataset.ytcbBlocked;
    element.style.removeProperty("display");
}

/**
 * ユーザーをブロックリストへ追加する
 */
async function blockUser(userName) {
    const normalizedName = userName.trim();

    if (!normalizedName) {
        return;
    }

    const data = await chrome.storage.sync.get({
        blockedUsers: []
    });

    const blockedUsers =
        normalizeList(data.blockedUsers);

    if (!blockedUsers.includes(normalizedName)) {
        blockedUsers.push(normalizedName);

        await chrome.storage.sync.set({
            blockedUsers
        });
    }
}

/**
 * 「返信」ボタンの右側へブロックアイコンを追加する
 */
function addBlockButton(comment, author, authorName) {
    if (
        comment.querySelector(
            ":scope .ytcb-block-btn"
        )
    ) {
        return;
    }

    const replyButton =
        comment.querySelector("#reply-button-end");

    if (!replyButton) {
        return;
    }

    const button =
        document.createElement("button");

    button.type = "button";
    button.className = "ytcb-block-btn";
    button.textContent = "🚫";
    button.title =
        `${authorName} をブロック`;

    button.setAttribute(
        "aria-label",
        `${authorName} をブロック`
    );

    button.addEventListener(
        "click",
        async event => {
            event.preventDefault();
            event.stopPropagation();

            button.disabled = true;

            try {
                await blockUser(authorName);

                /*
                 * storage.onChangedでも再処理されるが、
                 * 押したコメントはすぐ非表示にする。
                 */
                hideElement(comment);
            } catch (error) {
                console.error(
                    "ユーザーのブロックに失敗しました。",
                    error
                );

                button.disabled = false;
            }
        }
    );

    /*
     * 作者名リンク内には追加せず、
     * 「返信」ボタンの直後へ配置する。
     */
    replyButton.insertAdjacentElement(
        "afterend",
        button
    );
}

/**
 * 通常コメントと返信を処理する
 */
function processNormalComments() {
    document
        .querySelectorAll(
            "ytd-comment-view-model"
        )
        .forEach(comment => {
            const author =
                comment.querySelector(
                    "a#author-text"
                );

            const text =
                comment.querySelector(
                    "#content-text"
                );

            if (!author) {
                return;
            }

            const authorName =
                author.textContent.trim();

            const commentText =
                text?.textContent || "";

            const blocked =
                shouldBlock(
                    authorName,
                    commentText
                );

            if (blocked) {
                hideElement(comment);
                return;
            }

            /*
             * ブロックリストから削除された場合は、
             * リロードせず再表示する。
             */
            showElement(comment);

            addBlockButton(
                comment,
                author,
                authorName
            );
        });
}

/**
 * ライブチャットを処理する
 */
function processLiveChat() {
    document
        .querySelectorAll(
            [
                "yt-live-chat-text-message-renderer",
                "yt-live-chat-paid-message-renderer",
                "yt-live-chat-membership-item-renderer"
            ].join(",")
        )
        .forEach(chat => {
            const author =
                chat.querySelector(
                    "#author-name"
                );

            const message =
                chat.querySelector(
                    "#message"
                );

            const authorName =
                author?.textContent.trim() || "";

            const messageText =
                message?.textContent || "";

            const blocked =
                shouldBlock(
                    authorName,
                    messageText
                );

            if (blocked) {
                hideElement(chat);
            } else {
                showElement(chat);
            }
        });
}

/**
 * コメント処理を実行する
 */
async function processComments() {
    if (processing) {
        processRequested = true;
        return;
    }

    processing = true;

    try {
        do {
            processRequested = false;

            processNormalComments();
            processLiveChat();
        } while (processRequested);
    } catch (error) {
        console.error(
            "コメント処理中にエラーが発生しました。",
            error
        );
    } finally {
        processing = false;
    }
}

/**
 * MutationObserverの連続実行を抑制する
 */
let processTimer = null;

function scheduleProcess() {
    if (processTimer !== null) {
        return;
    }

    processTimer = window.setTimeout(() => {
        processTimer = null;
        processComments();
    }, 100);
}

/**
 * 初期化
 */
async function initialize() {
    await loadSettings();
    await processComments();

    const observer =
        new MutationObserver(() => {
            scheduleProcess();
        });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

initialize().catch(error => {
    console.error(
        "YouTube Comment Blockerの初期化に失敗しました。",
        error
    );
});

/**
 * 設定画面でユーザーやNGワードが変更された場合、
 * ページをリロードせず即時反映する。
 */
chrome.storage.onChanged.addListener(
    async (changes, areaName) => {
        if (areaName !== "sync") {
            return;
        }

        if (
            !changes.blockedUsers &&
            !changes.blockedWords
        ) {
            return;
        }

        await loadSettings();
        await processComments();
    }
);
