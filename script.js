const searchInput = document.querySelector('.search-box input')

// ---------- REAL LIKE / UNLIKE ----------

document.addEventListener('click', async function (event) {
  const likeButton = event.target.closest('.like-btn')

  if (!likeButton) return

  const postCard = likeButton.closest('.post-card')

  if (!postCard) return

  const token = localStorage.getItem('token')

  if (!token) {
    alert('Please login first.')
    window.location.href = 'login.html'
    return
  }

  // Post ID ko card par save kiya hua hoga
  const postId = postCard.dataset.postId

  if (!postId) {
    alert('Post ID not found.')
    return
  }

  try {
    // Agar already liked hai → UNLIKE
    if (likeButton.classList.contains('liked')) {
      const response = await fetch(
        `http://localhost:5000/api/likes/${postId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Unable to unlike post.')
        return
      }

      likeButton.classList.remove('liked')
    } else {
      // LIKE
      const response = await fetch(
        `http://localhost:5000/api/likes/${postId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Unable to like post.')
        return
      }

      likeButton.classList.add('liked')
    }

    // Updated count
    await loadLikeCount(postId, likeButton)
  } catch (error) {
    console.error('Like Error:', error)

    alert('Cannot connect to VYORA server.')
  }
})
// ---------- LOAD LIKE COUNT ----------

async function loadLikeCount (postId, likeButton) {
  try {
    const response = await fetch(`http://localhost:5000/api/likes/${postId}`)

    const data = await response.json()

    if (response.ok) {
      const count = likeButton.querySelector('span')

      if (count) {
        count.textContent = data.likes
      }
    }
  } catch (error) {
    console.error('Like Count Error:', error)
  }
}

// ---------- REAL FOLLOW / UNFOLLOW ----------

document.addEventListener('click', async function (event) {
  const followButton = event.target.closest('.follow-btn')

  if (!followButton) return

  const token = localStorage.getItem('token')

  if (!token) {
    alert('Please login first.')
    window.location.href = 'login.html'
    return
  }

  const userId = followButton.dataset.userId

  if (!userId) {
    alert('User ID not found.')
    return
  }

  try {
    if (followButton.classList.contains('following')) {
      // UNFOLLOW
      const response = await fetch(
        `http://localhost:5000/api/follows/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Unable to unfollow user.')
        return
      }

      followButton.classList.remove('following')
      followButton.textContent = 'Follow'

      followButton.style.background = '#7254e8'
      followButton.style.color = 'white'
    } else {
      // FOLLOW
      const response = await fetch(
        `http://localhost:5000/api/follows/${userId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Unable to follow user.')
        return
      }

      followButton.classList.add('following')
      followButton.textContent = 'Following'

      followButton.style.background = '#eeeaff'
      followButton.style.color = '#7254e8'
    }
  } catch (error) {
    console.error('Follow Error:', error)

    alert('Cannot connect to VYORA server.')
  }
})

// ---------- CREATE POST WITH PHOTO / VIDEO ----------

const postButton = document.querySelector('.post-btn')
const postInput = document.getElementById('postInput')
const photoInput = document.getElementById('photoInput')
const videoInput = document.getElementById('videoInput')
const selectedMedia = document.getElementById('selectedMedia')

let selectedFile = null

// PHOTO SELECT

if (photoInput) {
  photoInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      selectedFile = this.files[0]

      showSelectedFile(selectedFile)

      // Clear video selection
      if (videoInput) {
        videoInput.value = ''
      }
    }
  })
}

// VIDEO SELECT

if (videoInput) {
  videoInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      selectedFile = this.files[0]

      showSelectedFile(selectedFile)

      // Clear photo selection
      if (photoInput) {
        photoInput.value = ''
      }
    }
  })
}

// SHOW SELECTED FILE

function showSelectedFile (file) {
  if (!selectedMedia) return

  selectedMedia.innerHTML = `
        <div class="selected-file">
            <span>📎 ${file.name}</span>

            <button
                type="button"
                id="removeMedia"
            >
                ✕
            </button>
        </div>
    `

  const removeButton = document.getElementById('removeMedia')

  if (removeButton) {
    removeButton.addEventListener('click', function () {
      selectedFile = null

      selectedMedia.innerHTML = ''

      if (photoInput) {
        photoInput.value = ''
      }

      if (videoInput) {
        videoInput.value = ''
      }
    })
  }
}

// POST BUTTON

if (postButton) {
  postButton.addEventListener('click', async function () {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please login first.')

      window.location.href = 'login.html'

      return
    }

    const text = postInput ? postInput.value.trim() : ''

    if (text === '' && !selectedFile) {
      alert('Please write something or select a photo/video.')

      return
    }

    const formData = new FormData()

    formData.append('content', text)

    if (selectedFile) {
      formData.append('media', selectedFile)
    }

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`
        },

        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Post failed.')

        return
      }

      alert('Post created successfully!')

      if (postInput) {
        postInput.value = ''
      }

      selectedFile = null

      if (selectedMedia) {
        selectedMedia.innerHTML = ''
      }

      if (photoInput) {
        photoInput.value = ''
      }

      if (videoInput) {
        videoInput.value = ''
      }

      loadPosts()
    } catch (error) {
      console.error('Create Post Error:', error)

      alert('Cannot connect to VYORA server.')
    }
  })
}
// ---------- REAL USER SEARCH ----------

if (searchInput) {
  const searchBox = searchInput.closest('.search-box')

  // Create search results container
  const searchResults = document.createElement('div')

  searchResults.className = 'search-results'

  searchBox.appendChild(searchResults)

  // SEARCH USERS
  searchInput.addEventListener('input', async function () {
    const searchValue = this.value.trim()

    searchResults.innerHTML = ''

    if (searchValue === '') {
      searchResults.style.display = 'none'
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/search?q=${encodeURIComponent(
          searchValue
        )}`
      )

      const users = await response.json()

      if (!response.ok) {
        searchResults.style.display = 'none'
        return
      }

      if (users.length === 0) {
        searchResults.innerHTML = `
          <div class="search-no-result">
            No users found
          </div>
        `

        searchResults.style.display = 'block'
        return
      }

      users.forEach(user => {
        const result = document.createElement('div')

        result.className = 'search-user'

        result.innerHTML = `
          <div class="search-user-avatar">
            ${user.name.charAt(0).toUpperCase()}
          </div>

          <div class="search-user-info">
            <strong>${user.name}</strong>
            <span>@${user.username}</span>
          </div>
        `

        result.addEventListener('click', function () {
          window.location.href = `profile.html?username=${encodeURIComponent(
            user.username
          )}`
        })

        searchResults.appendChild(result)
      })

      searchResults.style.display = 'block'
    } catch (error) {
      console.error('User Search Error:', error)

      searchResults.style.display = 'none'
    }
  })

  // ENTER KEY
  searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault()

      const searchValue = this.value.trim()

      if (searchValue !== '') {
        const firstUser = searchResults.querySelector('.search-user')

        if (firstUser) {
          firstUser.click()
        }
      }
    }
  })

  // CLOSE SEARCH WHEN CLICKING OUTSIDE
  document.addEventListener('click', function (event) {
    if (!searchBox.contains(event.target)) {
      searchResults.style.display = 'none'
    }
  })
}

// ---------- LOGOUT ----------

const logoutLink = document.querySelector('a[href="login.html"]')

if (logoutLink) {
  logoutLink.addEventListener('click', function (event) {
    const confirmLogout = confirm('Are you sure you want to logout?')

    if (!confirmLogout) {
      event.preventDefault()
    }
  })
}

// ---------- UNIFIED THEME ENGINE ----------

function applyTheme (theme) {
  const isDark = theme === 'dark'

  if (isDark) {
    document.body.classList.add('dark-mode')
    localStorage.setItem('theme', 'dark')
  } else {
    document.body.classList.remove('dark-mode')
    localStorage.setItem('theme', 'light')
  }

  // Update theme buttons in navbar
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.innerHTML = isDark
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon"></i>'
  })

  // Update settings page theme button
  document.querySelectorAll('.settings-theme-btn').forEach(btn => {
    btn.innerHTML = isDark
      ? '<i class="bi bi-sun"></i> Light Mode'
      : '<i class="bi bi-moon"></i> Dark Mode'
  })
}

// Global click handler for theme toggles
document.addEventListener('click', function (e) {
  const themeToggle = e.target.closest('.theme-btn, .settings-theme-btn')
  if (themeToggle) {
    const isDarkNow = document.body.classList.contains('dark-mode')
    applyTheme(isDarkNow ? 'light' : 'dark')
  }
})

// Initialize theme immediately
applyTheme(localStorage.getItem('theme') || 'light')

// ---------- REAL COMMENTS ----------

document.addEventListener('click', async function (event) {
  const commentButton = event.target.closest('.comment-btn')

  if (!commentButton) return

  const post = commentButton.closest('.post-card')

  if (!post) return

  let commentBox = post.querySelector('.comment-box')

  if (commentBox) {
    commentBox.remove()
    return
  }

  commentBox = document.createElement('div')
  commentBox.className = 'comment-box'

  commentBox.innerHTML = `
    <input type="text" placeholder="Write a comment...">
    <button>Post</button>
    <div class="comments-list"></div>
  `

  post.appendChild(commentBox)

  const input = commentBox.querySelector('input')
  const postComment = commentBox.querySelector('button')
  const commentsList = commentBox.querySelector('.comments-list')

  const postId = post.dataset.postId

  // LOAD EXISTING COMMENTS
  try {
    const response = await fetch(`http://localhost:5000/api/comments/${postId}`)

    const comments = await response.json()

    if (response.ok) {
      comments.forEach(comment => {
        const commentText = document.createElement('p')

        commentText.className = 'new-comment'

        commentText.innerHTML = `
          <strong>${comment.name}:</strong> ${comment.comment}
        `

        commentsList.appendChild(commentText)
      })
    }
  } catch (error) {
    console.error('Load Comments Error:', error)
  }

  // ADD COMMENT
  postComment.addEventListener('click', async function () {
    const comment = input.value.trim()
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please login first.')
      window.location.href = 'login.html'
      return
    }

    if (comment === '') {
      alert('Please write a comment!')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${postId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            comment: comment
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Comment failed.')
        return
      }

      const commentText = document.createElement('p')

      commentText.className = 'new-comment'

      const user = JSON.parse(localStorage.getItem('user'))

      commentText.innerHTML = `
        <strong>${user.name}:</strong> ${comment}
      `

      commentsList.appendChild(commentText)

      input.value = ''
    } catch (error) {
      console.error('Comment Error:', error)

      alert('Cannot connect to VYORA server.')
    }
  })
})

// ---------- LOGIN FORM ----------

const loginForm = document.getElementById('loginForm')

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault()

    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value.trim()

    if (email === '' || password === '') {
      alert('Please fill all fields.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Login failed.')
        return
      }

      // Save login information
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      alert('Login successful! Welcome to VYORA 💜')

      window.location.href = 'index.html'
    } catch (error) {
      console.error('Login Error:', error)
      alert('Cannot connect to VYORA server. Make sure backend is running.')
    }
  })
}

// ---------- REGISTER FORM ----------

const registerForm = document.getElementById('registerForm')

if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault()

    const name = document.getElementById('name').value.trim()
    const username = document.getElementById('username').value.trim()
    const email = document.getElementById('registerEmail').value.trim()
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (
      name === '' ||
      username === '' ||
      email === '' ||
      password === '' ||
      confirmPassword === ''
    ) {
      alert('Please fill all fields.')
      return
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          username: username,
          email: email,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Registration failed.')
        return
      }

      alert('Account created successfully! 💜')

      window.location.href = 'login.html'
    } catch (error) {
      console.error('Register Error:', error)
      alert('Cannot connect to VYORA server.')
    }
  })
}
// ---------- SHARE & SAVE ----------

document.addEventListener('click', async function (event) {
  // SHARE BUTTON
  const shareButton = event.target.closest('.share-btn')

  if (shareButton) {
    const post = shareButton.closest('.post-card')

    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Post link copied! 🔗💜')
    } catch (error) {
      alert('Post shared! 💜')
    }
  }

  // SAVE BUTTON
  const saveButton = event.target.closest('.save-btn')

  if (saveButton) {
    if (saveButton.classList.contains('saved')) {
      saveButton.classList.remove('saved')
      saveButton.innerHTML = '♧'
      alert('Post removed from saved!')
    } else {
      saveButton.classList.add('saved')
      saveButton.innerHTML = '🔖'
      alert('Post saved! 🔖💜')
    }
  }
})
// ---------- LOAD POSTS FROM DATABASE ----------

async function loadPosts () {
  const feed = document.querySelector('.feed')

  if (!feed) return

  try {
    const response = await fetch('http://localhost:5000/api/posts')
    const posts = await response.json()

    if (!response.ok) {
      console.error('Failed to load posts')
      return
    }

    // Remove old sample posts
    const oldPosts = feed.querySelectorAll('.post-card')
    oldPosts.forEach(post => post.remove())

    posts.forEach(post => {
      const postCard = document.createElement('article')
      postCard.dataset.postId = post.id
      postCard.className = 'post-card'

      postCard.innerHTML = `
        <div class="post-header">
          <div class="author">
            <img
              src="public/assests/images/avatars/avatar_1.jpg"
              class="avatar"
              alt="${post.name}"
            >

            <div>
              <h3>${post.name}</h3>
              <p>@${post.username} · ${new Date(
        post.created_at
      ).toLocaleString()}</p>
            </div>
          </div>

         <div class="post-menu-container">
  <button class="more" onclick="togglePostMenu(this)">
    <i class="bi bi-three-dots"></i>
  </button>

  <div class="post-menu">
    <button onclick="editPost()">
      <i class="bi bi-pencil"></i>
      Edit Post
    </button>

    <button onclick="deletePost()">
      <i class="bi bi-trash"></i>
      Delete Post
    </button>
  </div>
</div>
        </div>

        <div class="post-content">

    ${post.content ? `<p class="caption">${post.content}</p>` : ''}

    ${
      post.image
        ? post.image.match(/\.(mp4|webm|mov)$/i)
          ? `
                <video
                    class="post-media"
                    src="http://localhost:5000${post.image}"
                    controls
                ></video>
            `
          : `
                <img
                    class="post-media"
                    src="http://localhost:5000${post.image}"
                    alt="Post image"
                />
            `
        : ''
    }

</div>

        <div class="post-actions">
          <button class="like-btn">
            ♡ <span>0</span>
          </button>

          <button class="comment-btn">
            ♧ Comment
          </button>

          <button class="share-btn">
            ↗ Share
          </button>

          <button class="save-btn">
            ♧
          </button>
        </div>
      `

      feed.appendChild(postCard)
      const likeButton = postCard.querySelector('.like-btn')

      if (likeButton) {
        loadLikeCount(post.id, likeButton)
      }
    })
  } catch (error) {
    console.error('Load Posts Error:', error)
  }
}

// Load posts when page opens
loadPosts()
// ---------- REAL NOTIFICATIONS ----------

async function loadNotifications () {
  const notificationsPage = document.querySelector('.notifications-page')

  if (!notificationsPage) return

  const token = localStorage.getItem('token')

  if (!token) {
    window.location.href = 'login.html'
    return
  }

  try {
    const response = await fetch('http://localhost:5000/api/notifications', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const notifications = await response.json()

    if (!response.ok) {
      alert(notifications.message || 'Unable to load notifications.')
      return
    }

    // Remove old fake notifications
    const oldSections = notificationsPage.querySelectorAll(
      '.notification-section'
    )

    oldSections.forEach(section => section.remove())

    if (notifications.length === 0) {
      const emptyMessage = document.createElement('div')

      emptyMessage.className = 'notification-empty'

      emptyMessage.innerHTML = `
        <h3>No notifications yet</h3>
        <p>Your notifications will appear here.</p>
      `

      notificationsPage.appendChild(emptyMessage)

      return
    }

    const section = document.createElement('section')

    section.className = 'notification-section'

    section.innerHTML = `<h2>Recent</h2>`

    notifications.forEach(notification => {
      const card = document.createElement('div')

      card.className = 'notification-card'

      if (!notification.is_read) {
        card.classList.add('unread')
      }

      let icon = '🔔'

      if (notification.type === 'follow') {
        icon = '👤'
      } else if (notification.type === 'like') {
        icon = '❤️'
      } else if (notification.type === 'comment') {
        icon = '💬'
      }

      const senderName = notification.sender_name || 'Someone'

      const time = new Date(notification.created_at).toLocaleString()

      card.innerHTML = `
        <div class="notification-content">
          <p>
            <strong>${senderName}</strong>
            ${notification.message}
          </p>

          <span>${time}</span>
        </div>

        <div class="notification-icon">
          ${icon}
        </div>
      `

      section.appendChild(card)
    })

    notificationsPage.appendChild(section)
  } catch (error) {
    console.error('Notifications Error:', error)

    alert('Cannot connect to VYORA server.')
  }
}

// ---------- MARK ALL NOTIFICATIONS AS READ ----------

const markReadButton = document.querySelector('.mark-read-btn')

if (markReadButton) {
  markReadButton.addEventListener('click', async function () {
    const token = localStorage.getItem('token')

    if (!token) {
      window.location.href = 'login.html'
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const notifications = await response.json()

      for (const notification of notifications) {
        if (!notification.is_read) {
          await fetch(
            `http://localhost:5000/api/notifications/${notification.id}/read`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )
        }
      }

      alert('All notifications marked as read.')

      loadNotifications()
    } catch (error) {
      console.error('Mark Read Error:', error)

      alert('Cannot connect to VYORA server.')
    }
  })
}

// Load notifications
loadNotifications()
// ---------- NOTIFICATION BELL ----------

const notificationBell = document.querySelector('.notification-bell')

if (notificationBell) {
  notificationBell.style.cursor = 'pointer'

  notificationBell.addEventListener('click', () => {
    window.location.href = 'notification.html'
  })
}
// ---------- REAL PROFILE ----------

const editProfileButton = document.querySelector('.edit-profile-btn')

if (editProfileButton) {
  editProfileButton.addEventListener('click', async function () {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please login first.')
      window.location.href = 'login.html'
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const user = await response.json()

      if (!response.ok) {
        alert(user.message || 'Unable to load profile.')
        return
      }

      const name = prompt('Enter your name:', user.name)

      if (name === null) return

      const username = prompt('Enter your username:', user.username)

      if (username === null) return

      const bio = prompt('Enter your bio:', user.bio || '')

      if (bio === null) return

      const updateResponse = await fetch(
        'http://localhost:5000/api/users/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name.trim(),
            username: username.trim(),
            bio: bio.trim()
          })
        }
      )

      const data = await updateResponse.json()

      if (!updateResponse.ok) {
        alert(data.message || 'Profile update failed.')
        return
      }

      // Update local storage
      const oldUser = JSON.parse(localStorage.getItem('user')) || {}

      oldUser.name = name.trim()
      oldUser.username = username.trim()

      localStorage.setItem('user', JSON.stringify(oldUser))

      alert('Profile updated successfully!')

      location.reload()
    } catch (error) {
      console.error('Profile Error:', error)

      alert('Cannot connect to VYORA server.')
    }
  })
}
// ---------- LOAD MY PROFILE ----------

async function loadMyProfile () {
  const profilePage = document.querySelector('.profile-page')

  if (!profilePage) return

  const token = localStorage.getItem('token')

  if (!token) {
    window.location.href = 'login.html'
    return
  }

  try {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const user = await response.json()

    if (!response.ok) {
      alert(user.message || 'Unable to load profile.')
      return
    }

    // Name
    const nameElement = document.querySelector('.profile-info h1')

    // Username
    const usernameElement = document.querySelector('.profile-info .username')

    // Bio
    const bioElement = document.querySelector('.profile-info .bio')

    // Navbar name
    const miniName = document.querySelector('.user-mini span')

    // Posts count
    const stats = document.querySelectorAll('.profile-stats div strong')

    if (nameElement) {
      nameElement.textContent = user.name
    }

    if (usernameElement) {
      usernameElement.textContent = '@' + user.username
    }

    if (bioElement) {
      bioElement.textContent = user.bio || 'No bio added yet.'
    }

    if (miniName) {
      miniName.textContent = user.name
    }

    // REAL COUNTS
    if (stats.length >= 3) {
      stats[0].textContent = user.posts_count
      stats[1].textContent = user.followers_count
      stats[2].textContent = user.following_count
    }
  } catch (error) {
    console.error('Profile Load Error:', error)
  }
}

loadMyProfile()
// ---------- PROFILE DROPDOWN ----------

const userMenuButton = document.getElementById('userMenuButton')

const profileDropdown = document.getElementById('profileDropdown')

if (userMenuButton && profileDropdown) {
  userMenuButton.addEventListener('click', function (event) {
    event.stopPropagation()

    profileDropdown.classList.toggle('show')
  })

  document.addEventListener('click', function () {
    profileDropdown.classList.remove('show')
  })
}

// ---------- DROPDOWN USER DATA ----------

async function loadDropdownUser () {
  const token = localStorage.getItem('token')

  if (!token) return

  try {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const user = await response.json()

    if (!response.ok) return

    const name = document.getElementById('dropdownName')

    const username = document.getElementById('dropdownUsername')

    if (name) {
      name.textContent = user.name
    }

    if (username) {
      username.textContent = '@' + user.username
    }
  } catch (error) {
    console.error('Dropdown User Error:', error)
  }
}

loadDropdownUser()

// ---------- LOGOUT ----------

const logoutBtn = document.getElementById('logoutBtn')

if (logoutBtn) {
  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    window.location.href = 'login.html'
  })
}
// ---------- SETTINGS PAGE ----------
// Settings theme toggle is handled globally by applyTheme()

// ---------- SETTINGS LOGOUT ----------

const settingsLogoutBtn = document.getElementById('settingsLogoutBtn')

if (settingsLogoutBtn) {
  settingsLogoutBtn.addEventListener('click', function () {
    localStorage.removeItem('token')

    localStorage.removeItem('user')

    window.location.href = 'login.html'
  })
}
// ---------- PUBLIC USER PROFILE ----------

async function loadPublicProfile () {
  const profilePage = document.querySelector('.profile-page')

  if (!profilePage) return

  const params = new URLSearchParams(window.location.search)

  const userId = params.get('user')

  // No ?user= means own profile
  if (!userId) return

  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`)

    const user = await response.json()

    if (!response.ok) {
      alert(user.message || 'User not found.')

      window.location.href = 'index.html'

      return
    }

    // ---------- PROFILE INFORMATION ----------

    const nameElement = document.querySelector('.profile-info h1')

    const usernameElement = document.querySelector('.profile-info .username')

    const bioElement = document.querySelector('.profile-info .bio')

    const stats = document.querySelectorAll('.profile-stats div strong')

    if (nameElement) {
      nameElement.textContent = user.name
    }

    if (usernameElement) {
      usernameElement.textContent = '@' + user.username
    }

    if (bioElement) {
      bioElement.textContent = user.bio || 'No bio added yet.'
    }

    // ---------- REAL COUNTS ----------

    if (stats.length >= 3) {
      stats[0].textContent = user.posts_count

      stats[1].textContent = user.followers_count

      stats[2].textContent = user.following_count
    }

    // ---------- PROFILE BUTTON ----------

    const oldEditButton = document.querySelector('.edit-profile-btn')

    if (oldEditButton) {
      oldEditButton.style.display = 'none'
    }

    // ---------- LOAD USER POSTS ----------

    await loadPublicUserPosts(userId)
  } catch (error) {
    console.error('Public Profile Error:', error)
  }
}

// ---------- LOAD PUBLIC USER POSTS ----------

async function loadPublicUserPosts (userId) {
  const postsContainer = document.querySelector('.profile-posts')

  if (!postsContainer) return

  try {
    const response = await fetch(`http://localhost:5000/api/posts`)

    const posts = await response.json()

    if (!response.ok) return

    postsContainer.innerHTML = ''

    const userPosts = posts.filter(
      post => Number(post.user_id) === Number(userId)
    )

    if (userPosts.length === 0) {
      postsContainer.innerHTML = `
                <div class="no-profile-posts">
                    <h3>No posts yet</h3>
                    <p>This user hasn't posted anything yet.</p>
                </div>
            `

      return
    }

    userPosts.forEach(post => {
      const postElement = document.createElement('div')

      postElement.className = 'profile-post'

      if (post.image) {
        const isVideo = /\.(mp4|webm|mov)$/i.test(post.image)

        if (isVideo) {
          postElement.innerHTML = `
                        <video
                            src="http://localhost:5000${post.image}"
                            controls
                        ></video>
                    `
        } else {
          postElement.innerHTML = `
                        <img
                            src="http://localhost:5000${post.image}"
                            alt="Post"
                        >
                    `
        }
      } else {
        postElement.innerHTML = `
                    <div class="text-profile-post">
                        ${post.content}
                    </div>
                `
      }

      postsContainer.appendChild(postElement)
    })
  } catch (error) {
    console.error('Public Posts Error:', error)
  }
}

loadPublicProfile()

// ================= STORIES VIEWER =================

const stories = document.querySelectorAll('.story')

let currentStory = 0

// Create Story Modal
const storyModal = document.createElement('div')
storyModal.className = 'story-modal'

storyModal.innerHTML = `
    <div class="story-viewer">

        <button class="story-close">✕</button>

        <button class="story-prev">‹</button>

        <img class="story-view-image" src="" alt="Story">

        <div class="story-user">
            <img class="story-user-avatar" src="" alt="">
            <span class="story-user-name"></span>
        </div>

        <button class="story-next">›</button>

    </div>
`

document.body.appendChild(storyModal)

// OPEN STORY
function openStory (index) {
  if (!stories.length) return

  currentStory = index

  const story = stories[currentStory]

  const storyImage = story.querySelector(':scope > img')
  const avatarImage = story.querySelector('.story-avatar img')
  const storyName = story.querySelector('p')

  const viewerImage = storyModal.querySelector('.story-view-image')
  const viewerAvatar = storyModal.querySelector('.story-user-avatar')
  const viewerName = storyModal.querySelector('.story-user-name')

  if (storyImage) {
    viewerImage.src = storyImage.src
  }

  if (avatarImage) {
    viewerAvatar.src = avatarImage.src
  }

  if (storyName) {
    viewerName.textContent = storyName.textContent
  }

  storyModal.classList.add('show')
}

// CLICK STORY
stories.forEach((story, index) => {
  story.style.cursor = 'pointer'

  story.addEventListener('click', function () {
    openStory(index)
  })
})

// NEXT STORY
storyModal.querySelector('.story-next').addEventListener('click', function () {
  currentStory++

  if (currentStory >= stories.length) {
    currentStory = 0
  }

  openStory(currentStory)
})

// PREVIOUS STORY
storyModal.querySelector('.story-prev').addEventListener('click', function () {
  currentStory--

  if (currentStory < 0) {
    currentStory = stories.length - 1
  }

  openStory(currentStory)
})

// CLOSE STORY
storyModal.querySelector('.story-close').addEventListener('click', function () {
  storyModal.classList.remove('show')
})

// CLOSE WHEN CLICK OUTSIDE
storyModal.addEventListener('click', function (event) {
  if (event.target === storyModal) {
    storyModal.classList.remove('show')
  }
})

// KEYBOARD CONTROLS
document.addEventListener('keydown', function (event) {
  if (!storyModal.classList.contains('show')) return

  if (event.key === 'ArrowRight') {
    currentStory++

    if (currentStory >= stories.length) {
      currentStory = 0
    }

    openStory(currentStory)
  }

  if (event.key === 'ArrowLeft') {
    currentStory--

    if (currentStory < 0) {
      currentStory = stories.length - 1
    }

    openStory(currentStory)
  }

  if (event.key === 'Escape') {
    storyModal.classList.remove('show')
  }
})
// =========================
// EXPLORE PAGE FUNCTIONALITY
// =========================

const explorePosts = document.querySelectorAll('.explore-post')
const topicCards = document.querySelectorAll('.topic-card')

// =========================
// 1. SEARCH EXPLORE POSTS
// =========================

if (searchInput && explorePosts.length > 0) {
  searchInput.addEventListener('input', function () {
    const searchText = searchInput.value.toLowerCase().trim()

    explorePosts.forEach(function (post) {
      const image = post.querySelector('img')

      if (!image) return

      const imageName = image.src.toLowerCase()

      if (searchText === '' || imageName.includes(searchText)) {
        post.style.display = 'block'
      } else {
        post.style.display = 'none'
      }
    })
  })
}

// =========================
// 2. TRENDING TOPIC CLICK
// =========================

topicCards.forEach(function (topic) {
  topic.style.cursor = 'pointer'

  topic.addEventListener('click', function () {
    const topicName = topic.querySelector('strong').textContent.toLowerCase()

    explorePosts.forEach(function (post) {
      const image = post.querySelector('img')

      if (!image) return

      const imageName = image.src.toLowerCase()

      // WebDevelopment
      if (topicName.includes('webdevelopment')) {
        if (imageName.includes('post1')) {
          post.style.display = 'block'
        } else {
          post.style.display = 'none'
        }
      }

      // Study
      else if (topicName.includes('study')) {
        if (imageName.includes('post3')) {
          post.style.display = 'block'
        } else {
          post.style.display = 'none'
        }
      }

      // Travel
      else if (topicName.includes('travel')) {
        if (imageName.includes('post2')) {
          post.style.display = 'block'
        } else {
          post.style.display = 'none'
        }
      }

      // Lifestyle
      else if (topicName.includes('lifestyle')) {
        if (imageName.includes('post4') || imageName.includes('post5')) {
          post.style.display = 'block'
        } else {
          post.style.display = 'none'
        }
      }
    })
  })
})

// =========================
// 3. EXPLORE POST VIEWER
// =========================

if (explorePosts.length > 0) {
  const exploreViewer = document.createElement('div')

  exploreViewer.className = 'explore-viewer'

  exploreViewer.innerHTML = `
        <div class="explore-viewer-box">

            <button class="explore-close">✕</button>

            <img class="explore-viewer-image" src="" alt="Post">

            <div class="explore-viewer-info">
                <span>❤️ <b class="viewer-likes"></b></span>
                <span>💬 <b class="viewer-comments"></b></span>
            </div>

        </div>
    `

  document.body.appendChild(exploreViewer)

  explorePosts.forEach(function (post) {
    post.addEventListener('click', function () {
      const image = post.querySelector('img')
      const overlay = post.querySelector('.explore-overlay')

      if (!image) return

      exploreViewer.querySelector('.explore-viewer-image').src = image.src

      if (overlay) {
        const numbers = overlay.textContent.match(/\d+/g)

        if (numbers) {
          exploreViewer.querySelector('.viewer-likes').textContent =
            numbers[0] || '0'

          exploreViewer.querySelector('.viewer-comments').textContent =
            numbers[1] || '0'
        }
      }

      exploreViewer.classList.add('show')
    })
  })

  // CLOSE

  exploreViewer
    .querySelector('.explore-close')
    .addEventListener('click', function () {
      exploreViewer.classList.remove('show')
    })

  // CLICK OUTSIDE

  exploreViewer.addEventListener('click', function (event) {
    if (event.target === exploreViewer) {
      exploreViewer.classList.remove('show')
    }
  })

  // ESC KEY

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && exploreViewer.classList.contains('show')) {
      exploreViewer.classList.remove('show')
    }
  })
}
// ================= POST MENU =================

function togglePostMenu (button) {
  const menu = button.nextElementSibling

  // Close other menus
  document.querySelectorAll('.post-menu').forEach(function (item) {
    if (item !== menu) {
      item.style.display = 'none'
    }
  })

  // Open / close clicked menu
  if (menu.style.display === 'block') {
    menu.style.display = 'none'
  } else {
    menu.style.display = 'block'
  }
}

// ================= EDIT POST =================

function editPost () {
  alert('Edit Post clicked')
}

// ================= DELETE POST =================

function deletePost () {
  const confirmDelete = confirm('Are you sure you want to delete this post?')

  if (confirmDelete) {
    alert('Post deleted!')
  }
}

// Close menu when clicking outside
document.addEventListener('click', function (event) {
  if (!event.target.closest('.post-menu-container')) {
    document.querySelectorAll('.post-menu').forEach(function (menu) {
      menu.style.display = 'none'
    })
  }
})
