import { User, AuthResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  private readonly STORAGE_KEY = 'chatflow_auth';

  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user exists in localStorage
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('User not found');
    }

    // In real app, you'd verify password hash
    const authData: AuthResponse = {
      user,
      token: this.generateToken(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
    return user;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = this.getStoredUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('chatflow_users', JSON.stringify(users));

    const authData: AuthResponse = {
      user: newUser,
      token: this.generateToken(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
    return newUser;
  }

  getCurrentUser(): User | null {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (authData) {
        const parsed: AuthResponse = JSON.parse(authData);
        return parsed.user;
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private generateToken(): string {
    return btoa(Math.random().toString()).substring(0, 24);
  }

  private getStoredUsers(): User[] {
    try {
      const users = localStorage.getItem('chatflow_users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  }
}

export const authService = new AuthService();