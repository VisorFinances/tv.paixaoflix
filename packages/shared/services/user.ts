import { User, APIResponse, Subscription, UserPreferences } from '../types';

export class UserService {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async getProfile(userId: string): Promise<APIResponse<User>> {
    const response = await fetch(`${this.baseURL}/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<APIResponse<User>> {
    const response = await fetch(`${this.baseURL}/user/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<APIResponse<User>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/preferences`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    
    return response.json();
  }

  async getSubscription(userId: string): Promise<APIResponse<Subscription>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/subscription`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async upgradeSubscription(userId: string, plan: 'premium' | 'family'): Promise<APIResponse<Subscription>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/subscription/upgrade`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });
    
    return response.json();
  }

  async cancelSubscription(userId: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/subscription/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.json();
  }

  async signIn(email: string, password: string): Promise<APIResponse<{ user: User; token: string }>> {
    const response = await fetch(`${this.baseURL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return response.json();
  }

  async signUp(email: string, password: string, name: string): Promise<APIResponse<{ user: User; token: string }>> {
    const response = await fetch(`${this.baseURL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });
    
    return response.json();
  }

  async signOut(userId: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    return response.json();
  }

  async resetPassword(email: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    return response.json();
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/user/${userId}/password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    return response.json();
  }

  async deleteAccount(userId: string, password: string): Promise<APIResponse<void>> {
    const response = await fetch(`${this.baseURL}/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    return response.json();
  }
}
