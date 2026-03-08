// Posts API Service

import api from '../api';
import type {
  Post,
  CreatePostRequest,
  ReactRequest,
  PostsResponse,
} from './types';

const POSTS_ENDPOINTS = {
  getAll: '/api/posts',
  create: '/api/posts',
  react: '/api/react',
};

/**
 * Get all community posts
 * @returns List of posts with reactions
 */
export async function getPosts(): Promise<PostsResponse> {
  return api.get<PostsResponse>(POSTS_ENDPOINTS.getAll);
}

/**
 * Create a new post
 * @param request - Post creation request
 * @returns Created post
 */
export async function createPost(request: CreatePostRequest): Promise<Post> {
  return api.post<Post>(POSTS_ENDPOINTS.create, request);
}

/**
 * React to a post
 * @param request - Reaction request with post_id and reaction_type
 * @returns Updated reaction counts
 */
export async function reactToPost(request: ReactRequest): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(POSTS_ENDPOINTS.react, request);
}

// Export posts API object
export const postsApi = {
  getPosts,
  createPost,
  reactToPost,
};
