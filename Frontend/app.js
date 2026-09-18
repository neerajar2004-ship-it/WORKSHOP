```javascript
const API_URL = "http://localhost:8080/api/posts";

const USERNAME = "InstaUser";

const PROFILE_PIC =
    "https://i.pravatar.cc/150?img=12";

const form = document.getElementById("post-form");
const captionInput = document.getElementById("caption-input");
const imageInput = document.getElementById("image-input");
const feed = document.getElementById("feed");

let posts = [];
let postData = {};


/* ================================
   CREATE DEFAULT POST DATA
================================ */

function createPostData() {
    return {
        liked: false,
        likes: 0,
        saved: false,
        comments: []
    };
}


/* ================================
   POPUP MESSAGE
================================ */

function showPopup(message) {

    const oldPopup = document.querySelector(".popup");

    if (oldPopup) {
        oldPopup.remove();
    }

    const popup = document.createElement("div");

    popup.className = "popup";
    popup.textContent = message;

    document.body.appendChild(popup);

    setTimeout(function () {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 2000);
}


/* ================================
   SECURITY
================================ */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
}


/* ================================
   POST KEY
================================ */

function getPostKey(post) {
    return `${post.caption}_${post.imageUrl}`;
}


/* ================================
   LOAD POSTS
================================ */

async function loadPosts() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load posts");
        }

        posts = await response.json();

        posts.forEach(function (post) {

            const key = getPostKey(post);

            if (!postData[key]) {
                postData[key] = createPostData();
            }

        });

        renderPosts();

    } catch (error) {

        console.error(error);

        feed.innerHTML = "";

        const emptyFeed = document.createElement("div");

        emptyFeed.className = "empty-feed";

        emptyFeed.textContent =
            "Unable to connect to the backend.";

        feed.appendChild(emptyFeed);
    }
}


/* ================================
   RENDER POSTS
================================ */

function renderPosts() {

    feed.innerHTML = "";

    if (posts.length === 0) {

        const emptyFeed = document.createElement("div");

        emptyFeed.className = "empty-feed";

        emptyFeed.textContent =
            "No posts yet. Create your first post! 📸";

        feed.appendChild(emptyFeed);

        return;
    }


    posts.forEach(function (post) {

        const key = getPostKey(post);

        if (!postData[key]) {
            postData[key] = createPostData();
        }

        const data = postData[key];

        const postCard = document.createElement("article");

        postCard.className = "post-card";


        postCard.innerHTML = `

            <div class="post-header">

                <div class="post-profile">
                    <img
                        src="${PROFILE_PIC}"
                        alt="Profile"
                    >
                </div>

                <span class="post-user">
                    ${escapeHTML(USERNAME)}
                </span>

                <button
                    class="post-more"
                    type="button"
                >
                    ⋯
                </button>

            </div>


            <div class="post-image-wrapper">

                <img
                    class="post-image"
                    src="${escapeHTML(post.imageUrl)}"
                    alt="Post image"
                >

            </div>


            <div class="post-actions">

                <div class="action-left">

                    <button
                        class="post-action-btn like-btn ${data.liked ? "liked" : ""}"
                        data-key="${escapeHTML(key)}"
                        type="button"
                        title="Like"
                    >
                        ${data.liked ? "❤️" : "♡"}
                    </button>

                    <button
                        class="post-action-btn comment-btn"
                        data-key="${escapeHTML(key)}"
                        type="button"
                        title="Comment"
                    >
                        💬
                    </button>

                    <button
                        class="post-action-btn share-btn"
                        data-key="${escapeHTML(key)}"
                        type="button"
                        title="Share"
                    >
                        ➤
                    </button>

                </div>

                <button
                    class="post-action-btn save-btn"
                    data-key="${escapeHTML(key)}"
                    type="button"
                    title="Save"
                >
                    ${data.saved ? "🔖" : "☆"}
                </button>

            </div>


            <div class="likes-count">

                ${data.likes}
                ${data.likes === 1 ? " like" : " likes"}

            </div>


            <div class="caption">

                <strong>
                    ${escapeHTML(USERNAME)}
                </strong>

                ${escapeHTML(post.caption)}

            </div>


            <div
                class="comment-toggle"
                data-key="${escapeHTML(key)}"
            >

                ${
                    data.comments.length === 0
                        ? "Add a comment..."
                        : `View all ${data.comments.length} comment${data.comments.length === 1 ? "" : "s"}`
                }

            </div>


            <div
                class="comments-section"
                data-key="${escapeHTML(key)}"
            >

                <div class="comments-list">

                    ${
                        data.comments.length === 0
                            ? `
                                <div class="no-comments">
                                    No comments yet.
                                </div>
                              `
                            : data.comments.map(function (comment) {
                                return `
                                    <div class="comment-item">
                                        <strong>
                                            ${escapeHTML(USERNAME)}
                                        </strong>
                                        ${escapeHTML(comment)}
                                    </div>
                                `;
                            }).join("")
                    }

                </div>


                <div class="comment-form">

                    <input
                        class="comment-input"
                        type="text"
                        placeholder="Add a comment..."
                        maxlength="200"
                    >

                    <button
                        class="add-comment-btn"
                        data-key="${escapeHTML(key)}"
                        type="button"
                    >
                        Post
                    </button>

                </div>

            </div>
        `;


        feed.appendChild(postCard);

    });
}


/* ================================
   CREATE NEW POST
================================ */

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const caption = captionInput.value.trim();

    const file = imageInput.files[0];


    if (!caption || !file) {

        showPopup(
            "Please add a caption and image."
        );

        return;
    }


    if (!file.type.startsWith("image/")) {

        showPopup(
            "Please select an image file."
        );

        return;
    }


    const reader = new FileReader();


    reader.onload = async function () {

        try {

            const post = {
                caption: caption,
                imageUrl: reader.result
            };


            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(post)

            });


            if (!response.ok) {

                throw new Error(
                    "Failed to create post"
                );
            }


            const savedPost =
                await response.json();


            posts.unshift(savedPost);


            postData[getPostKey(savedPost)] =
                createPostData();


            form.reset();


            renderPosts();


            showPopup(
                "🎉 Your post has been shared!"
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(error);

            showPopup(
                "Unable to share post."
            );
        }
    };


    reader.onerror = function () {

        showPopup(
            "Unable to read the image."
        );

    };


    reader.readAsDataURL(file);

});


/* ================================
   FEED BUTTONS
================================ */

feed.addEventListener("click", async function (event) {


    /* LIKE */

    const likeButton =
        event.target.closest(".like-btn");


    if (likeButton) {

        const key =
            likeButton.dataset.key;


        if (!postData[key]) {
            postData[key] =
                createPostData();
        }


        postData[key].liked =
            !postData[key].liked;


        if (postData[key].liked) {

            postData[key].likes++;

        } else {

            postData[key].likes =
                Math.max(
                    0,
                    postData[key].likes - 1
                );
        }


        renderPosts();

        return;
    }


    /* COMMENT */

    const commentButton =
        event.target.closest(".comment-btn");

    const commentToggle =
        event.target.closest(".comment-toggle");


    if (commentButton || commentToggle) {

        const clicked =
            commentButton || commentToggle;

        const key =
            clicked.dataset.key;


        const section =
            feed.querySelector(
                `.comments-section[data-key="${CSS.escape(key)}"]`
            );


        if (section) {

            if (section.style.display === "block") {

                section.style.display = "none";

            } else {

                section.style.display = "block";

                const input =
                    section.querySelector(
                        ".comment-input"
                    );

                if (input) {
                    input.focus();
                }
            }
        }

        return;
    }


    /* ADD COMMENT */

    const addCommentButton =
        event.target.closest(
            ".add-comment-btn"
        );


    if (addCommentButton) {

        const key =
            addCommentButton.dataset.key;


        if (!postData[key]) {
            postData[key] =
                createPostData();
        }


        const section =
            addCommentButton.closest(
                ".comments-section"
            );


        const input =
            section.querySelector(
                ".comment-input"
            );


        const comment =
            input.value.trim();


        if (!comment) {

            showPopup(
                "Write a comment first."
            );

            return;
        }


        postData[key].comments.push(
            comment
        );


        renderPosts();


        const newSection =
            feed.querySelector(
                `.comments-section[data-key="${CSS.escape(key)}"]`
            );


        if (newSection) {
            newSection.style.display = "block";
        }


        showPopup(
            "Comment added! 💬"
        );

        return;
    }


    /* SAVE */

    const saveButton =
        event.target.closest(".save-btn");


    if (saveButton) {

        const key =
            saveButton.dataset.key;


        if (!postData[key]) {
            postData[key] =
                createPostData();
        }


        postData[key].saved =
            !postData[key].saved;


        renderPosts();


        showPopup(
            postData[key].saved
                ? "Post saved! 🔖"
                : "Post removed from saved."
        );

        return;
    }


    /* SHARE */

    const shareButton =
        event.target.closest(".share-btn");


    if (shareButton) {

        const key =
            shareButton.dataset.key;


        const post =
            posts.find(function (item) {
                return getPostKey(item) === key;
            });


        if (!post) {
            return;
        }


        openShareMenu(post);

        return;
    }

});


/* ================================
   SHARE MENU
================================ */

function openShareMenu(post) {

    const oldMenu =
        document.querySelector(".share-menu");


    if (oldMenu) {
        oldMenu.remove();
    }


    const shareMenu =
        document.createElement("div");


    shareMenu.className = "share-menu";


    shareMenu.innerHTML = `

        <div class="share-box">

            <div class="share-title">
                Share Post
            </div>


            <button
                class="share-option"
                data-share="native"
                type="button"
            >

                <span class="share-option-icon">
                    📤
                </span>

                <span>
                    Share with others
                </span>

            </button>


            <button
                class="share-option"
                data-share="copy"
                type="button"
            >

                <span class="share-option-icon">
                    🔗
                </span>

                <span>
                    Copy post text
                </span>

            </button>


            <button
                class="share-option"
                data-share="whatsapp"
                type="button"
            >

                <span class="share-option-icon">
                    💬
                </span>

                <span>
                    Share on WhatsApp
                </span>

            </button>


            <button
                class="cancel-share"
                type="button"
            >
                Cancel
            </button>

        </div>
    `;


    document.body.appendChild(shareMenu);


    const shareText =
        `${USERNAME}: ${post.caption}`;


    /* NATIVE SHARE */

    const nativeButton =
        shareMenu.querySelector(
            '[data-share="native"]'
        );


    nativeButton.addEventListener(
        "click",
        async function () {

            try {

                if (navigator.share) {

                    await navigator.share({
                        title: "InstaLite Post",
                        text: shareText
                    });

                    showPopup(
                        "Post shared! 📤"
                    );

                } else {

                    await copyText(shareText);

                    showPopup(
                        "Post text copied! 📋"
                    );
                }


                shareMenu.remove();

            } catch (error) {

                if (error.name !== "AbortError") {

                    showPopup(
                        "Unable to share post."
                    );
                }
            }
        }
    );


    /* COPY */

    const copyButton =
        shareMenu.querySelector(
            '[data-share="copy"]'
        );


    copyButton.addEventListener(
        "click",
        async function () {

            try {

                await copyText(shareText);

                showPopup(
                    "Post text copied! 📋"
                );

                shareMenu.remove();

            } catch (error) {

                console.error(error);

                showPopup(
                    "Unable to copy."
                );
            }
        }
    );


    /* WHATSAPP */

    const whatsappButton =
        shareMenu.querySelector(
            '[data-share="whatsapp"]'
        );


    whatsappButton.addEventListener(
        "click",
        function () {

            const text =
                encodeURIComponent(
                    shareText
                );


            window.open(
                `https://wa.me/?text=${text}`,
                "_blank"
            );


            shareMenu.remove();
        }
    );


    /* CANCEL */

    const cancelButton =
        shareMenu.querySelector(
            ".cancel-share"
        );


    cancelButton.addEventListener(
        "click",
        function () {

            shareMenu.remove();

        }
    );


    /* CLICK OUTSIDE */

    shareMenu.addEventListener(
        "click",
        function (event) {

            if (event.target === shareMenu) {
                shareMenu.remove();
            }

        }
    );
}



async function copyText(text) {

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        await navigator.clipboard.writeText(
            text
        );

        return;
    }


    const textarea =
        document.createElement("textarea");


    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.focus();
    textarea.select();


    document.execCommand("copy");


    textarea.remove();
}

