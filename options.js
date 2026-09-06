async function loadData() {

    const data = await chrome.storage.sync.get({
        blockedUsers: [],
        blockedWords: [],
        darkMode: false
    });

    renderUsers(data.blockedUsers);
    renderWords(data.blockedWords);

    document.getElementById(
        "userCount"
    ).textContent =
        data.blockedUsers.length;

    document.getElementById(
        "wordCount"
    ).textContent =
        data.blockedWords.length;

    const darkMode =
        document.getElementById(
            "darkMode"
        );

    if (darkMode) {

        darkMode.checked =
            data.darkMode;

        document.body.classList.toggle(
            "dark",
            data.darkMode
        );
    }
}

function renderUsers(users) {

    const ul =
        document.getElementById(
            "userList"
        );

    ul.innerHTML = "";

    users.forEach(user => {

        const li =
            document.createElement("li");

        const text =
            document.createElement("span");

        text.textContent = user;

        const btn =
            document.createElement("button");

        btn.textContent = "削除";

        btn.onclick = () =>
            removeUser(user);

        li.appendChild(text);
        li.appendChild(btn);

        ul.appendChild(li);
    });
}

function renderWords(words) {

    const ul =
        document.getElementById(
            "wordList"
        );

    ul.innerHTML = "";

    words.forEach(word => {

        const li =
            document.createElement("li");

        const text =
            document.createElement("span");

        text.textContent = word;

        const btn =
            document.createElement("button");

        btn.textContent = "削除";

        btn.onclick = () =>
            removeWord(word);

        li.appendChild(text);
        li.appendChild(btn);

        ul.appendChild(li);
    });
}

async function addUser() {

    const input =
        document.getElementById(
            "userInput"
        );

    const value =
        input.value.trim();

    if (!value) {
        return;
    }

    const data =
        await chrome.storage.sync.get({
            blockedUsers: []
        });

    const users = [
        ...new Set([
            ...data.blockedUsers,
            value
        ])
    ];

    await chrome.storage.sync.set({
        blockedUsers: users
    });

    input.value = "";
}

async function addWord() {

    const input =
        document.getElementById(
            "wordInput"
        );

    const value =
        input.value.trim();

    if (!value) {
        return;
    }

    const data =
        await chrome.storage.sync.get({
            blockedWords: []
        });

    const words = [
        ...new Set([
            ...data.blockedWords,
            value
        ])
    ];

    await chrome.storage.sync.set({
        blockedWords: words
    });

    input.value = "";
}

async function removeUser(user) {

    const data =
        await chrome.storage.sync.get({
            blockedUsers: []
        });

    await chrome.storage.sync.set({
        blockedUsers:
            data.blockedUsers.filter(
                x => x !== user
            )
    });
}

async function removeWord(word) {

    const data =
        await chrome.storage.sync.get({
            blockedWords: []
        });

    await chrome.storage.sync.set({
        blockedWords:
            data.blockedWords.filter(
                x => x !== word
            )
    });
}

async function exportCsv() {

    const data =
        await chrome.storage.sync.get({
            blockedUsers: [],
            blockedWords: []
        });

    const rows = [];

    rows.push("type,value");

    data.blockedUsers.forEach(user => {
        rows.push(`user,"${user}"`);
    });

    data.blockedWords.forEach(word => {
        rows.push(`word,
