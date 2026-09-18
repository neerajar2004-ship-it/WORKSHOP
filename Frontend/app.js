const API_URL = "http://localhost:8080/api/posts";

const USERNAME = "InstaUser";
const PROFILE_PIC = "https://i.pravatar.cc/150?img=12";

// --------------------------------------------------
// GET HTML ELEMENTS
// --------------------------------------------------

const form = document.getElementById("post-form");
const captionInput = document.getElementById("caption-input");
const imageInput = document.getElementById("image-input");
const feed = document.getElementById("feed");

// --------------------------------------------------
// DATA
// --------------------------------------------------

let posts = [];
const postData = {};

// --------------------------------------------------
// CREATE DEFAULT POST DATA
// --------------------------------------------------

function createPostData() {
    return {
        liked: false,
        likes: 0,
        saved: false,
        comments: []
    };
}

// --------------------------------------------------
// GET UNIQUE POST KEY
// --------------------------------------------------

function getPostKey(post) {
    return String(post.id || "") + "_" +
        String(post.caption || "") + "_" +
        String(post.imageUrl || "");
}

// --------------------------------------------------
// GET POST DATA
// --------------------------------------------------

function getPostState(post) {
    const key = getPostKey(post);

    if (!postData[key]) {
        postData[key] = createPostData();
    }

    return postData[key];
}

// --------------------------------------------------
// POPUP MESSAGE
// --------------------------------------------------

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

// --------------------------------------------------
// ESCAPE HTML
// --------------------------------------------------

function escapeHTML(text) {
    const div = document.createElement("div");

    div.textContent = text || "";

    return div.innerHTML;
}

// --------------------------------------------------
// LOAD POSTS
// --------------------------------------------------

async function loadPosts() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load posts");
        }

        const data = await response.json();

        posts = Array.isArray(data) ? data : [];

        posts.forEach(function (post) {
            getPostState(post);
        });

        renderPosts();

    } catch (error) {
        console.error("Load posts error:", error);

        feed.innerHTML = "";

        const errorBox = document.createElement("div");

        errorBox.className = "empty-feed";
        errorBox.textContent =
            "Unable to connect to the backend.";

        feed.appendChild(errorBox);
    }
}

// --------------------------------------------------
// RENDER POSTS
// --------------------------------------------------

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

    posts.forEach(function (post, index) {
        const state = getPostState(post);

        // POST CARD
        const postCard = document.createElement("div");

        postCard.className = "post-card";
        postCard.dataset.index = String(index);

        // --------------------------------------------------
        // POST HEADER
        // --------------------------------------------------

        const header = document.createElement("div");

        header.className = "post-header";

        const profileImage = document.createElement("img");

        profileImage.className = "post-profile-image";
        profileImage.src = PROFILE_PIC;
        profileImage.alt = "Profile";

        const username = document.createElement("strong");

        username.className = "post-username";
        username.textContent = USERNAME;

        header.appendChild(profileImage);
        header.appendChild(username);

        // --------------------------------------------------
        // POST IMAGE
        // --------------------------------------------------

        const image = document.createElement("img");

        image.className = "post-image";
        image.src = post.imageUrl || "";
        image.alt = post.caption || "Post image";
        image.loading = "lazy";

        // Double click to like
        image.addEventListener("dblclick", function () {
            if (!state.liked) {
                state.liked = true;
                state.likes += 1;

                renderPosts();

                showPopup("❤️ Liked!");
            }
        });

        // --------------------------------------------------
        // ACTIONS
        // --------------------------------------------------

        const actions = document.createElement("div");

        actions.className = "post-actions";

        // LIKE BUTTON
        const likeButton = document.createElement("button");

        likeButton.className = "action-button like-btn";

        likeButton.type = "button";
        likeButton.dataset.index = String(index);

        if (state.liked) {
            likeButton.classList.add("active");
            likeButton.textContent = "❤️";
        } else {
            likeButton.textContent = "♡";
        }

        likeButton.setAttribute("aria-label", "Like");

        // COMMENT BUTTON
        const commentButton = document.createElement("button");

        commentButton.className = "action-button comment-btn";
        commentButton.type = "button";
        commentButton.dataset.index = String(index);
        commentButton.textContent = "💬";
        commentButton.setAttribute("aria-label", "Comment");

        // SHARE BUTTON
        const shareButton = document.createElement("button");

        shareButton.className = "action-button share-btn";
        shareButton.type = "button";
        shareButton.dataset.index = String(index);
        shareButton.textContent = "📤";
        shareButton.setAttribute("aria-label", "Share");

        // SAVE BUTTON
        const saveButton = document.createElement("button");

        saveButton.className = "action-button save-btn";
        saveButton.type = "button";
        saveButton.dataset.index = String(index);

        if (state.saved) {
            saveButton.classList.add("active");
            saveButton.textContent = "🔖";
        } else {
            saveButton.textContent = "♡";
        }

        saveButton.setAttribute("aria-label", "Save");

        actions.appendChild(likeButton);
        actions.appendChild(commentButton);
        actions.appendChild(shareButton);

        const spacer = document.createElement("span");

        spacer.className = "action-spacer";

        actions.appendChild(spacer);
        actions.appendChild(saveButton);

        // --------------------------------------------------
        // LIKE COUNT
        // --------------------------------------------------

        const likes = document.createElement("div");

        likes.className = "likes-count";

        if (state.likes === 1) {
            likes.textContent = "1 like";
        } else {
            likes.textContent = state.likes + " likes";
        }

        // --------------------------------------------------
        // CAPTION
        // --------------------------------------------------

        const caption = document.createElement("div");

        caption.className = "caption";

        const captionUsername = document.createElement("strong");

        captionUsername.textContent = USERNAME;

        caption.appendChild(captionUsername);

        const captionText = document.createTextNode(
            " " + (post.caption || "")
        );

        caption.appendChild(captionText);

        // --------------------------------------------------
        // COMMENTS SECTION
        // --------------------------------------------------

        const commentsSection = document.createElement("div");

        commentsSection.className = "comments-section";

        commentsSection.style.display = "none";

        // Existing comments
        state.comments.forEach(function (comment) {
            const commentItem = document.createElement("div");

            commentItem.className = "comment-item";

            const commentUsername = document.createElement("strong");

            commentUsername.textContent = USERNAME;

            commentItem.appendChild(commentUsername);

            const commentText = document.createTextNode(
                " " + comment
            );

            commentItem.appendChild(commentText);

            commentsSection.appendChild(commentItem);
        });

        // Comment input area
        const commentForm = document.createElement("div");

        commentForm.className = "comment-form";

        const commentInput = document.createElement("input");

        commentInput.className = "comment-input";
        commentInput.type = "text";
        commentInput.placeholder = "Add a comment...";
        commentInput.maxLength = 300;

        const addCommentButton = document.createElement("button");

        addCommentButton.className = "add-comment-btn";
        addCommentButton.type = "button";
        addCommentButton.dataset.index = String(index);
        addCommentButton.textContent = "Post";

        commentForm.appendChild(commentInput);
        commentForm.appendChild(addCommentButton);

        commentsSection.appendChild(commentForm);

        // --------------------------------------------------
        // APPEND EVERYTHING
        // --------------------------------------------------

        postCard.appendChild(header);
        postCard.appendChild(image);
        postCard.appendChild(actions);
        postCard.appendChild(likes);
        postCard.appendChild(caption);
        postCard.appendChild(commentsSection);

        feed.appendChild(postCard);
    });
}

// --------------------------------------------------
// CREATE NEW POST
// --------------------------------------------------

if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const caption = captionInput.value.trim();
        const file = imageInput.files[0];

        if (!caption) {
            showPopup("Please write a caption.");
            return;
        }

        if (!file) {
            showPopup("Please select an image.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            showPopup("Please select a valid image.");
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
                    throw new Error("Failed to create post");
                }

                const savedPost = await response.json();

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
                console.error(
                    "Create post error:",
                    error
                );

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
}

// --------------------------------------------------
// FEED CLICK EVENTS
// --------------------------------------------------

feed.addEventListener("click", function (event) {

    // --------------------------------------------------
    // LIKE
    // --------------------------------------------------

    const likeButton =
        event.target.closest(".like-btn");

    if (likeButton) {
        const index =
            Number(likeButton.dataset.index);

        if (
            Number.isNaN(index) ||
            !posts[index]
        ) {
            return;
        }

        const state =
            getPostState(posts[index]);

        if (state.liked) {
            state.liked = false;

            if (state.likes > 0) {
                state.likes -= 1;
            }

            showPopup("Like removed.");

        } else {
            state.liked = true;
            state.likes += 1;

            showPopup("❤️ Liked!");
        }

        renderPosts();

        return;
    }

    // --------------------------------------------------
    // COMMENT TOGGLE
    // --------------------------------------------------

    const commentButton =
        event.target.closest(".comment-btn");

    if (commentButton) {
        const postCard =
            commentButton.closest(".post-card");

        if (!postCard) {
            return;
        }

        const commentsSection =
            postCard.querySelector(
                ".comments-section"
            );

        if (!commentsSection) {
            return;
        }

        if (
            commentsSection.style.display === "none" ||
            commentsSection.style.display === ""
        ) {
            commentsSection.style.display = "block";

            const input =
                commentsSection.querySelector(
                    ".comment-input"
                );

            if (input) {
                input.focus();
            }

        } else {
            commentsSection.style.display = "none";
        }

        return;
    }

    // --------------------------------------------------
    // ADD COMMENT
    // --------------------------------------------------

    const addCommentButton =
        event.target.closest(".add-comment-btn");

    if (addCommentButton) {
        const index =
            Number(addCommentButton.dataset.index);

        if (
            Number.isNaN(index) ||
            !posts[index]
        ) {
            return;
        }

        const state =
            getPostState(posts[index]);

        const postCard =
            addCommentButton.closest(".post-card");

        if (!postCard) {
            return;
        }

        const input =
            postCard.querySelector(".comment-input");

        if (!input) {
            return;
        }

        const comment =
            input.value.trim();

        if (!comment) {
            showPopup(
                "Write a comment first."
            );

            input.focus();

            return;
        }

        state.comments.push(comment);

        input.value = "";

        renderPosts();

        const newPostCard =
            feed.querySelector(
                '.post-card[data-index="' +
                index +
                '"]'
            );

        if (newPostCard) {
            const newSection =
                newPostCard.querySelector(
                    ".comments-section"
                );

            if (newSection) {
                newSection.style.display =
                    "block";
            }
        }

        showPopup(
            "💬 Comment added!"
        );

        return;
    }

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    const saveButton =
        event.target.closest(".save-btn");

    if (saveButton) {
        const index =
            Number(saveButton.dataset.index);

        if (
            Number.isNaN(index) ||
            !posts[index]
        ) {
            return;
        }

        const state =
            getPostState(posts[index]);

        state.saved = !state.saved;

        renderPosts();

        if (state.saved) {
            showPopup("🔖 Post saved!");
        } else {
            showPopup("Post removed from saved.");
        }

        return;
    }

    // --------------------------------------------------
    // SHARE
    // --------------------------------------------------

    const shareButton =
        event.target.closest(".share-btn");

    if (shareButton) {
        const index =
            Number(shareButton.dataset.index);

        if (
            Number.isNaN(index) ||
            !posts[index]
        ) {
            return;
        }

        showShareModal(posts[index]);

        return;
    }
});

// --------------------------------------------------
// SHARE MODAL
// --------------------------------------------------

function showShareModal(post) {

    // Remove old modal
    const existingModal =
        document.querySelector(".share-modal");

    if (existingModal) {
        existingModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.className = "share-modal";

    const overlay =
        document.createElement("div");

    overlay.className = "share-overlay";

    const shareBox =
        document.createElement("div");

    shareBox.className = "share-box";

    // --------------------------------------------------
    // TITLE
    // --------------------------------------------------

    const title =
        document.createElement("div");

    title.className = "share-title";
    title.textContent = "Share Post";

    shareBox.appendChild(title);

    // --------------------------------------------------
    // NATIVE SHARE
    // --------------------------------------------------

    const nativeButton =
        document.createElement("button");

    nativeButton.className = "share-option";
    nativeButton.type = "button";
    nativeButton.dataset.share = "native";

    const nativeIcon =
        document.createElement("span");

    nativeIcon.className =
        "share-option-icon";

    nativeIcon.textContent = "📤";

    const nativeText =
        document.createElement("span");

    nativeText.textContent =
        "Share with others";

    nativeButton.appendChild(nativeIcon);
    nativeButton.appendChild(nativeText);

    shareBox.appendChild(nativeButton);

    // --------------------------------------------------
    // COPY
    // --------------------------------------------------

    const copyButton =
        document.createElement("button");

    copyButton.className = "share-option";
    copyButton.type = "button";
    copyButton.dataset.share = "copy";

    const copyIcon =
        document.createElement("span");

    copyIcon.className =
        "share-option-icon";

    copyIcon.textContent = "🔗";

    const copyText =
        document.createElement("span");

    copyText.textContent =
        "Copy post text";

    copyButton.appendChild(copyIcon);
    copyButton.appendChild(copyText);

    shareBox.appendChild(copyButton);

    // --------------------------------------------------
    // WHATSAPP
    // --------------------------------------------------

    const whatsappButton =
        document.createElement("button");

    whatsappButton.className =
        "share-option";

    whatsappButton.type = "button";
    whatsappButton.dataset.share =
        "whatsapp";

    const whatsappIcon =
        document.createElement("span");

    whatsappIcon.className =
        "share-option-icon";

    whatsappIcon.textContent = "💬";

    const whatsappText =
        document.createElement("span");

    whatsappText.textContent =
        "Share on WhatsApp";

    whatsappButton.appendChild(
        whatsappIcon
    );

    whatsappButton.appendChild(
        whatsappText
    );

    shareBox.appendChild(
        whatsappButton
    );

    // --------------------------------------------------
    // CANCEL
    // --------------------------------------------------

    const cancelButton =
        document.createElement("button");

    cancelButton.className =
        "cancel-share";

    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";

    shareBox.appendChild(
        cancelButton
    );

    // --------------------------------------------------
    // ADD MODAL TO PAGE
    // --------------------------------------------------

    modal.appendChild(overlay);
    modal.appendChild(shareBox);

    document.body.appendChild(modal);

    // --------------------------------------------------
    // CLOSE MODAL
    // --------------------------------------------------

    function closeModal() {
        if (modal.parentNode) {
            modal.remove();
        }
    }

    overlay.addEventListener(
        "click",
        closeModal
    );

    cancelButton.addEventListener(
        "click",
        closeModal
    );

    // --------------------------------------------------
    // SHARE TEXT
    // --------------------------------------------------

    const shareText =
        USERNAME +
        ": " +
        (post.caption || "");

    // --------------------------------------------------
    // NATIVE SHARE
    // --------------------------------------------------

    nativeButton.addEventListener(
        "click",
        async function () {

            if (
                typeof navigator.share !==
                "function"
            ) {
                showPopup(
                    "Native sharing is not supported here."
                );

                return;
            }

            try {
                await navigator.share({
                    title: "InstaLite Post",
                    text: shareText
                });

                showPopup(
                    "📤 Post shared!"
                );

                closeModal();

            } catch (error) {

                if (
                    error.name !==
                    "AbortError"
                ) {
                    console.error(
                        "Share error:",
                        error
                    );

                    showPopup(
                        "Unable to share post."
                    );
                }
            }
        }
    );

    // --------------------------------------------------
    // COPY TEXT
    // --------------------------------------------------

    copyButton.addEventListener(
        "click",
        async function () {

            try {

                if (
                    navigator.clipboard &&
                    window.isSecureContext
                ) {
                    await navigator.clipboard.writeText(
                        shareText
                    );

                } else {

                    const textarea =
                        document.createElement(
                            "textarea"
                        );

                    textarea.value =
                        shareText;

                    textarea.style.position =
                        "fixed";

                    textarea.style.left =
                        "-9999px";

                    document.body.appendChild(
                        textarea
                    );

                    textarea.focus();
                    textarea.select();

                    document.execCommand(
                        "copy"
                    );

                    textarea.remove();
                }

                showPopup(
                    "📋 Post text copied!"
                );

                closeModal();

            } catch (error) {

                console.error(
                    "Copy error:",
                    error
                );

                showPopup(
                    "Unable to copy text."
                );
            }
        }
    );

    // --------------------------------------------------
    // WHATSAPP SHARE
    // --------------------------------------------------

    whatsappButton.addEventListener(
        "click",
        function () {

            const whatsappUrl =
                "https://wa.me/?text=" +
                encodeURIComponent(
                    shareText
                );

            window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
            );

            closeModal();
        }
    );
}

// --------------------------------------------------
// FILE NAME DISPLAY
// --------------------------------------------------

if (imageInput) {
    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files[0];

            if (file) {
                showPopup(
                    "📸 Image selected!"
                );
            }
        }
    );
}

// --------------------------------------------------
// ENTER KEY FOR COMMENTS
// --------------------------------------------------

feed.addEventListener(
    "keydown",
    function (event) {

        if (
            event.target.classList.contains(
                "comment-input"
            ) &&
            event.key === "Enter"
        ) {
            event.preventDefault();

            const postCard =
                event.target.closest(
                    ".post-card"
                );

            if (!postCard) {
                return;
            }

            const button =
                postCard.querySelector(
                    ".add-comment-btn"
                );

            if (button) {
                button.click();
            }
        }
    }
);

// --------------------------------------------------
// START APPLICATION
// --------------------------------------------------

loadPosts();