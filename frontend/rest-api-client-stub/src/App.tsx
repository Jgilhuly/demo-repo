import React, { useState } from 'react';
import { ApiClient } from './client/apiClient';
import { PostList } from './components/PostList';
import { PostForm } from './components/PostForm';
import { UserList } from './components/UserList';
import { ApiStats } from './components/ApiStats';
import type { Post, User } from './types/api';
import './App.css';

const client = new ApiClient();

function App() {
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'create'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const posts = await client.getPosts();
      setPosts(posts);
    } catch {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await client.getUsers();
      setUsers(users);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: { title: string; body: string; userId: number }) => {
    setLoading(true);
    setError(null);
    try {
      await client.createPost(postData);
      await loadPosts();
      setActiveTab('posts');
    } catch {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await client.deletePost(id);
      await loadPosts();
    } catch {
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setPosts([]);
    setUsers([]);
  };

  React.useEffect(() => {
    if (activeTab === 'posts' && posts.length === 0) {
      loadPosts();
    }
    if (activeTab === 'users' && users.length === 0) {
      loadUsers();
    }
  }, [activeTab, posts.length, users.length]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>REST API Client Demo</h1>
        <p>Demonstrating TypeScript client with caching, retries, and error handling</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          View Posts
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          View Users
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''}
          onClick={() => setActiveTab('create')}
        >
          Create Post
        </button>
        <button onClick={clearData} className="clear-data">
          Clear Data
        </button>
      </nav>

      <main className="app-main">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            Loading...
          </div>
        )}

        {activeTab === 'posts' && (
          <PostList 
            posts={posts} 
            onDelete={handleDeletePost}
            onRefresh={loadPosts}
            loading={loading}
          />
        )}

        {activeTab === 'users' && (
          <UserList 
            users={users} 
            onRefresh={loadUsers}
            loading={loading}
          />
        )}

        {activeTab === 'create' && (
          <PostForm 
            onSubmit={handleCreatePost}
            users={users}
            loading={loading}
          />
        )}

        <ApiStats />
      </main>
    </div>
  );
}

export default App;
