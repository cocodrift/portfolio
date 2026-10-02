const express = require('express');
const crypto = require('crypto');
const Post = require('../models/post');
const connectDB = require('../config/db');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

const router = express.Router();


// --------------------------------------------------
// Helpers
// --------------------------------------------------

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}


function cleanMarkdown(markdown) {
  const html = marked.parse(markdown || '');

  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'strong',
      'em',
      'blockquote',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'pre',
      'code',
      'hr'
    ],

    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title']
    },

    allowedSchemes: [
      'http',
      'https',
      'mailto'
    ]
  });
}


// --------------------------------------------------
// Admin authentication
// --------------------------------------------------

function createAdminToken() {
  const timestamp = Date.now().toString();

  const signature = crypto
    .createHmac(
      'sha256',
      process.env.ADMIN_SESSION_SECRET
    )
    .update(timestamp)
    .digest('hex');

  return `${timestamp}.${signature}`;
}


function isValidAdminToken(token) {
  if (!token || !process.env.ADMIN_SESSION_SECRET) {
    return false;
  }

  const parts = token.split('.');

  if (parts.length !== 2) {
    return false;
  }

  const timestamp = Number(parts[0]);
  const signature = parts[1];

  if (!timestamp || !signature) {
    return false;
  }

  // Login expires after 7 days
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (Date.now() - timestamp > sevenDays) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac(
      'sha256',
      process.env.ADMIN_SESSION_SECRET
    )
    .update(parts[0])
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
}


function requireAdmin(req, res, next) {
  const token = req.cookies?.mshub_admin;

  if (!isValidAdminToken(token)) {
    return res.redirect('/admin/login');
  }

  next();
}


// --------------------------------------------------
// Existing site routes
// --------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    await connectDB();

    const posts = await Post.find({
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .limit(7)
      .lean();

    const featuredPost = posts[0] || null;
    const latestPosts = posts.slice(1);

    res.render('index', {
      featuredPost,
      latestPosts
    });
  } catch (error) {
    next(error);
  }
});


router.get('/profile', (req, res, next) => {
  try {
    res.render('profile');
  } catch (error) {
    next(error);
  }
});


router.get('/travel', (req, res, next) => {
  try {
    res.render('travel');
  } catch (error) {
    next(error);
  }
});


router.get('/fitness', (req, res, next) => {
  try {
    res.render('fitness');
  } catch (error) {
    next(error);
  }
});


router.get('/books', (req, res, next) => {
  try {
    res.render('books');
  } catch (error) {
    next(error);
  }
});


// --------------------------------------------------
// PUBLIC CONTENT HUB
// --------------------------------------------------

router.get('/learn', async (req, res, next) => {
  try {
    await connectDB();

    const category = req.query.category;

    const query = {
      status: 'published'
    };

    if (category) {
      query.category = category;
    }

    const posts = await Post.find(query)
      .sort({ publishedAt: -1 })
      .lean();

    res.render('learn', {
      posts,
      category: category || 'All'
    });

  } catch (error) {
    next(error);
  }
});


router.get('/learn/:slug', async (req, res, next) => {
  try {
    await connectDB();

    const post = await Post.findOne({
      slug: req.params.slug,
      status: 'published'
    }).lean();

    if (!post) {
      return res.status(404).render('404');
    }

    const articleHtml = cleanMarkdown(post.content);

    const relatedPosts = await Post.find({
      status: 'published',
      category: post.category,
      _id: { $ne: post._id }
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    res.render('article', {
      post,
      articleHtml,
      relatedPosts
    });

  } catch (error) {
    next(error);
  }
});


// --------------------------------------------------
// ADMIN LOGIN
// --------------------------------------------------

router.get('/admin/login', (req, res) => {
  res.render('admin/login', {
    error: null
  });
});


router.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (
    !process.env.ADMIN_PASSWORD ||
    !process.env.ADMIN_SESSION_SECRET
  ) {
    return res.status(500).send(
      'Admin environment variables are not configured.'
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).render('admin/login', {
      error: 'Incorrect password.'
    });
  }

  const token = createAdminToken();

  res.cookie('mshub_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.redirect('/admin/posts');
});


router.post('/admin/logout', requireAdmin, (req, res) => {
  res.clearCookie('mshub_admin');
  res.redirect('/admin/login');
});


// --------------------------------------------------
// ADMIN POSTS
// --------------------------------------------------

router.get('/admin/posts', requireAdmin, async (req, res, next) => {
  try {
    await connectDB();

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .lean();

    res.render('admin/posts', {
      posts
    });

  } catch (error) {
    next(error);
  }
});


// --------------------------------------------------
// NEW POST
// --------------------------------------------------

router.get('/admin/posts/new', requireAdmin, (req, res) => {
  res.render('admin/post-form', {
    post: null,
    error: null
  });
});


router.post('/admin/posts', requireAdmin, async (req, res, next) => {
  try {
    await connectDB();

    const {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      featuredImage,
      author,
      seoTitle,
      seoDescription,
      status
    } = req.body;

    if (!title || !content || !category) {
      return res.status(400).render('admin/post-form', {
        post: req.body,
        error: 'Title, category and content are required.'
      });
    }

    let finalSlug = slugify(slug || title);

    const existing = await Post.findOne({
      slug: finalSlug
    });

    if (existing) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    const post = new Post({
      title,
      slug: finalSlug,
      excerpt,
      content,
      category,
      tags: tags
        ? tags
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(Boolean)
        : [],
      featuredImage,
      author: author || 'M’s Hub KE',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      status: status === 'published'
        ? 'published'
        : 'draft',
      publishedAt:
        status === 'published'
          ? new Date()
          : undefined
    });

    await post.save();

    res.redirect('/admin/posts');

  } catch (error) {
    next(error);
  }
});


// --------------------------------------------------
// EDIT POST
// --------------------------------------------------

router.get(
  '/admin/posts/:id/edit',
  requireAdmin,
  async (req, res, next) => {
    try {
      await connectDB();

      const post = await Post.findById(req.params.id).lean();

      if (!post) {
        return res.status(404).send('Post not found.');
      }

      res.render('admin/post-form', {
        post: {
          ...post,
          tags: post.tags.join(', ')
        },
        error: null
      });

    } catch (error) {
      next(error);
    }
  }
);


router.post(
  '/admin/posts/:id',
  requireAdmin,
  async (req, res, next) => {
    try {
      await connectDB();

      const {
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        featuredImage,
        author,
        seoTitle,
        seoDescription,
        status
      } = req.body;

      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).send('Post not found.');
      }

      post.title = title;
      post.slug = slugify(slug || title);
      post.excerpt = excerpt;
      post.content = content;
      post.category = category;
      post.tags = tags
        ? tags
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(Boolean)
        : [];
      post.featuredImage = featuredImage;
      post.author = author || 'M’s Hub KE';
      post.seoTitle = seoTitle || title;
      post.seoDescription = seoDescription || excerpt;

      if (
        status === 'published' &&
        post.status !== 'published'
      ) {
        post.publishedAt = new Date();
      }

      post.status =
        status === 'published'
          ? 'published'
          : 'draft';

      await post.save();

      res.redirect('/admin/posts');

    } catch (error) {
      next(error);
    }
  }
);


// --------------------------------------------------
// DELETE POST
// --------------------------------------------------

router.post(
  '/admin/posts/:id/delete',
  requireAdmin,
  async (req, res, next) => {
    try {
      await connectDB();

      await Post.findByIdAndDelete(req.params.id);

      res.redirect('/admin/posts');

    } catch (error) {
      next(error);
    }
  }
);


// --------------------------------------------------
// Error handler
// --------------------------------------------------

router.use((err, req, res, next) => {
  console.error(err);

  res.status(500).send(
    'Something went wrong. Please try again later.'
  );
});


module.exports = router;
