const API_BASE_URL = 'https://nccattendance-1.onrender.com/api';

// Types
export interface Cadet {
  id: string;
  name: string;
  regNumber: string;
  rank: string;
  company: string;
  phone?: string;
  attendanceStatus: 'present' | 'absent' | 'leave' | 'unmarked';
}

export interface LoginRequest {
  regNumber: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  regNumber: string;
  company: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  cadet: Cadet;
}

export interface AttendanceRecord {
  id: string;
  cadetId: string;
  name: string;
  regNumber: string;
  rank: string;
  company: string;
  status: 'present' | 'absent' | 'leave';
  markedAt: string;
}

export interface DashboardStats {
  date: string;
  totalCadets: number;
  attendance: {
    present: number;
    absent: number;
    leave: number;
    unmarked: number;
    attendanceRate: number;
  };
}

// API Service Class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('ncc_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('ncc_token', response.token);
    return response;
  }

  async signup(cadetData: SignupRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(cadetData),
    });
    
    this.token = response.token;
    localStorage.setItem('ncc_token', response.token);
    return response;
  }

  async verifyToken(): Promise<{ cadet: Cadet }> {
    return this.request<{ cadet: Cadet }>('/auth/verify');
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('ncc_token');
  }

  // Cadet methods
  async getCadets(params?: {
    company?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    cadets: Cadet[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.company) searchParams.append('company', params.company);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/cadets?${queryString}` : '/cadets';
    
    return this.request(endpoint);
  }

  async getCadetById(id: string): Promise<Cadet> {
    return this.request<Cadet>(`/cadets/${id}`);
  }

  async getCadetsByCompany(company: string): Promise<{
    company: string;
    cadets: Cadet[];
  }> {
    return this.request(`/cadets/company/${company}`);
  }

  async updateProfile(data: { name: string; phone?: string }): Promise<{
    message: string;
    cadet: Cadet;
  }> {
    return this.request('/cadets/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Attendance methods
  async markAttendance(data: {
    status: 'present' | 'absent' | 'leave';
    date?: string;
  }): Promise<{
    message: string;
    attendance: {
      cadetId: string;
      date: string;
      status: string;
    };
  }> {
    return this.request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceByDate(date: string, company?: string): Promise<{
    date: string;
    attendance: AttendanceRecord[];
  }> {
    const queryString = company ? `?company=${company}` : '';
    return this.request(`/attendance/date/${date}${queryString}`);
  }

  async getTodayAttendance(company?: string): Promise<{
    date: string;
    attendance: AttendanceRecord[];
  }> {
    const queryString = company ? `?company=${company}` : '';
    return this.request(`/attendance/today${queryString}`);
  }

  async getAttendanceHistory(
    cadetId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    cadet: {
      id: string;
      name: string;
      regNumber: string;
    };
    history: Array<{
      date: string;
      status: string;
      markedAt: string;
    }>;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.append('limit', limit.toString());
    if (offset) searchParams.append('offset', offset.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString 
      ? `/attendance/history/${cadetId}?${queryString}` 
      : `/attendance/history/${cadetId}`;
    
    return this.request(endpoint);
  }

  async getAttendanceStats(params?: {
    startDate?: string;
    endDate?: string;
    company?: string;
  }): Promise<{
    dateRange: { start: string; end: string };
    totalCadets: number;
    stats: Array<{
      date: string;
      present: number;
      absent: number;
      leave: number;
      unmarked: number;
      total: number;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.company) searchParams.append('company', params.company);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/attendance/stats?${queryString}` : '/attendance/stats';
    
    return this.request(endpoint);
  }

  // Dashboard methods
  async getDashboardOverview(): Promise<DashboardStats> {
    return this.request('/dashboard/overview');
  }

  async getCompanyStats(): Promise<{
    date: string;
    companies: Array<{
      company: string;
      total: number;
      present: number;
      absent: number;
      leave: number;
      unmarked: number;
    }>;
  }> {
    return this.request('/dashboard/company-stats');
  }

  async getRecentActivity(limit?: number): Promise<{
    recentActivity: Array<{
      markedAt: string;
      status: string;
      cadet: {
        name: string;
        regNumber: string;
        company: string;
        rank: string;
      };
    }>;
  }> {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.request(`/dashboard/recent-activity${queryString}`);
  }

  async getAttendanceTrends(days?: number): Promise<{
    period: string;
    trends: Array<{
      date: string;
      present: number;
      absent: number;
      leave: number;
      unmarked: number;
    }>;
  }> {
    const queryString = days ? `?days=${days}` : '';
    return this.request(`/dashboard/trends${queryString}`);
  }

  async getPersonalDashboard(): Promise<{
    cadet: Cadet;
    todayAttendance: {
      status: string;
      markedAt: string | null;
    };
    statistics: {
      attendancePercentage: number;
      presentDays: number;
      totalDays: number;
      companyStats: {
        present: number;
        absent: number;
        leave: number;
      };
    };
    recentHistory: Array<{
      date: string;
      status: string;
    }>;
  }> {
    return this.request('/dashboard/personal');
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    return this.request('/health');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
