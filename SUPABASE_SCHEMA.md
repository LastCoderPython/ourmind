# Supabase Database Schema

To support all backend features (authentication, chat history, mood tracking, tasks, mind garden, and community), you need the following 8 tables in Supabase.

---

### 1. `users`
*(Stores core user profile data. Auth handled automatically by Supabase Auth)*
- `id` (uuid, Primary Key, references `auth.users`)
- `username` (text, unique)
- `created_at` (timestamp, default now())

### 2. `messages`
*(Stores the chat history so the LLM remembers previous turns in a session)*
- `id` (uuid, Primary Key)
- `user_id` (uuid, Foreign Key -> `users.id`)
- `session_id` (text, allows grouping conversations)
- `role` (text) - e.g., `"user"` or `"assistant"`
- `content` (text)
- `created_at` (timestamp)

### 3. `mood_logs`
*(Stores the dominant emotion detected by the AI during daily check-ins)*
- `id` (uuid, Primary Key)
- `user_id` (uuid, Foreign Key -> `users.id`)
- `emotion` (text) - e.g., `"joy"`, `"sadness"`
- `intensity` (float) - The model's confidence score (0.0 to 1.0)
- `date` (date) - Unique per user per day

### 4. `tasks`
*(Stores daily self-care checklists)*
- `id` (uuid, Primary Key)
- `user_id` (uuid, Foreign Key -> `users.id`)
- `description` (text) - e.g., "Drink water"
- `completed` (boolean, default false)
- `date` (date) - The day the task applies to
- `created_at` (timestamp)

### 5. `gardens`
*(Stores the state of the user's virtual mind tree)*
- `user_id` (uuid, Primary Key, Foreign Key -> `users.id`)
- `plant_stage` (integer) - 1 to 6 (Seed to Flourishing Tree)
- `health_score` (float) - 0 to 100
- `last_updated` (date) - to ensure it only grows once per day

### 6. `posts`
*(Community wall posts)*
- `id` (uuid, Primary Key)
- `author_id` (uuid, Foreign Key -> `users.id`, nullable for full anonymity)
- `username` (text) - e.g., "Anonymous_41"
- `content` (text)
- `created_at` (timestamp)

### 7. `reactions`
*(User reactions to community posts)*
- `id` (uuid, Primary Key)
- `post_id` (uuid, Foreign Key -> `posts.id`)
- `user_id` (uuid, Foreign Key -> `users.id`)
- `reaction_type` (text) - `"support"`, `"relate"`, or `"proud"`
- `created_at` (timestamp)
