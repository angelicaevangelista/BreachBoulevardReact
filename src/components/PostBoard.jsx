import React, { useRef, useState } from 'react';

const initialPost = {
  id: 0,
  title: 'What’s the best way to learn JavaScript?',
  content:
    'I’m just starting with web development, and I’d love to hear how others learned JavaScript.',
  timestamp: 'Posted by User123 • 2 hours ago',
  votes: 96,
  comments: [
    '<strong>User456:</strong> Start with freeCodeCamp—it’s excellent for beginners!',
    '<strong>DevGuru:</strong> Don’t forget to practice with small projects!',
  ],
};
function Post({ post }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [comments, setComments] = useState(post.comments);
  // Deliberately raw HTML is confined to this original XSS teaching lab.
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <h3
          className="text-lg font-bold text-orange-500"
          dangerouslySetInnerHTML={{ __html: post.title }}
        />
        <p className="text-sm text-gray-400">{post.timestamp}</p>
      </div>
      <p className="mt-2" dangerouslySetInnerHTML={{ __html: post.content }} />
      <div className="mt-4 flex items-center space-x-4">
        <button className="flex items-center text-gray-400 hover:text-orange-500">
          <i className="fas fa-arrow-up mr-1" /> <span>{post.votes}</span>
        </button>
        <button
          className="text-sm text-gray-400 hover:underline"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Comments ({comments.length})
        </button>
        <button className="flex items-center text-gray-400 hover:text-orange-500">
          <i className="fas fa-share mr-1" /> Share
        </button>
      </div>
      <div className={`${open ? '' : 'hidden '}mt-4 space-y-4`}>
        <textarea
          rows="2"
          className="w-full p-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Write a comment..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          className="bg-orange-600 text-white py-1 px-4 rounded-lg hover:bg-orange-700 transition"
          onClick={() => {
            setComments((value) => [...value, draft]);
            setDraft('');
          }}
        >
          Post Comment
        </button>
        <div className="comments space-y-2">
          {comments.map((comment, index) => (
            <p key={index} dangerouslySetInnerHTML={{ __html: comment }} />
          ))}
        </div>
      </div>
    </div>
  );
}
export default function PostBoard() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([initialPost]);
  const nextId = useRef(1);
  function submit(event) {
    event.preventDefault();
    const post = {
      id: nextId.current++,
      title,
      content,
      timestamp: 'Posted just now',
      votes: 0,
      comments: [],
    };
    setPosts((value) => [post, ...value]);
    setTitle('');
    setContent('');
  }
  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-orange-500 mb-4">Create a Post</h2>
        <form id="postForm" className="space-y-4" onSubmit={submit}>
          <input
            type="text"
            id="postTitle"
            placeholder="Title"
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <textarea
            id="postContent"
            rows="4"
            placeholder="Content..."
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button
            type="submit"
            className="bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition"
          >
            Post
          </button>
        </form>
      </div>
      <div id="posts" className="space-y-6">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
