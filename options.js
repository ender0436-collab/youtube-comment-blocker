async function loadData() {

    const data = await chrome.storage.sync.get({
        blockedUsers: [],
        blockedWords: []
    });

    renderUsers(data.blockedUsers);
    renderWords(data.blockedWords);
}

function renderUsers(users) {

    const ul = document.getElementById("userList");
    ul.innerHTML = "";

    users.forEach(user => {

        const li = document.createElement("li");

        const text = document.createTextNode(user);

        const btn = document.createElement("button");
        btn.textContent = "削除";

        btn.onclick = () => removeUser(user);

        li.appendChild(text);
        li.appendChild(btn);

        ul.appendChild(li);

    });
}

function renderWords(words) {

    const ul = document.getElementById("wordList");
    ul.innerHTML = "";

    words.forEach(word => {

        const li = document.createElement("li");

        const text = document.createTextNode(word);

        const btn = document.createElement("button");
        btn.textContent = "削除";

        btn.onclick = () => removeWord(word);

        li.appendChild(text);
        li.appendChild(btn);

        ul.appendChild(li);

    });
}

document.getElementById("addUser").onclick = async () => {

    const input = document.getElementById("userInput");
    const value = input.value.trim();

    if (!value) return;

    const data = await chrome.storage.sync.get({
        blockedUsers: []
    });

    data.blockedUsers.push(value);

    await chrome.storage.sync.set({
        blockedUsers: [...new Set(data.blockedUsers)]
    });

    input.value = "";

    loadData();
};

document.getElementById("addWord").onclick = async () => {

    const input = document.getElementById("wordInput");
    const value = input.value.trim();

    if (!value) return;

    const data = await chrome.storage.sync.get({
        blockedWords: []
    });

    data.blockedWords.push(value);

    await chrome.storage.sync.set({
        blockedWords: [...new Set(data.blockedWords)]
    });

    input.value = "";

    loadData();
};

async function removeUser(user) {

    const data = await chrome.storage.sync.get({
        blockedUsers: []
    });

    await chrome.storage.sync.set({
        blockedUsers:
            data.blockedUsers.filter(
                x => x !== user
            )
    });

    loadData();
}

async function removeWord(word) {

    const data = await chrome.storage.sync.get({
        blockedWords: []
    });

    await chrome.storage.sync.set({
        blockedWords:
            data.blockedWords.filter(
                x => x !== word
            )
    });

    loadData();
}

loadData();