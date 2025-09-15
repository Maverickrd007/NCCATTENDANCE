import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Calendar, TrendingUp, Clock } from "lucide-react";

interface DashboardStats {
  totalCadets: number;
  presentToday: number;
  absentToday: number;
  onLeave: number;
  attendanceRate: number;
}

interface RecentActivity {
  id: string;
  cadetName: string;
  action: 'marked_present' | 'marked_absent' | 'marked_leave';
  time: string;
}

const Dashboard = () => {
  // Mock data - in real app this would come from API/database
  const stats: DashboardStats = {
    totalCadets: 150,
    presentToday: 142,
    absentToday: 5,
    onLeave: 3,
    attendanceRate: 94.7,
  };

  const recentActivity: RecentActivity[] = [
    { id: '1', cadetName: 'Cadet Sharma, R.', action: 'marked_present', time: '09:30 AM' },
    { id: '2', cadetName: 'Cadet Singh, P.', action: 'marked_present', time: '09:28 AM' },
    { id: '3', cadetName: 'Cadet Kumar, A.', action: 'marked_leave', time: '09:25 AM' },
    { id: '4', cadetName: 'Cadet Patel, M.', action: 'marked_present', time: '09:22 AM' },
  ];

  const getActivityBadge = (action: string) => {
    switch (action) {
      case 'marked_present':
        return <Badge className="ncc-badge-present">Present</Badge>;
      case 'marked_absent':
        return <Badge className="ncc-badge-absent">Absent</Badge>;
      case 'marked_leave':
        return <Badge className="ncc-badge-leave">On Leave</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">NCC Attendance Dashboard</h1>
        <p className="text-muted-foreground">Today's attendance overview and statistics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ncc-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cadets</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalCadets}</div>
            <p className="text-xs text-muted-foreground">Active registered cadets</p>
          </CardContent>
        </Card>

        <Card className="ncc-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
            <UserCheck className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.presentToday}</div>
            <p className="text-xs text-muted-foreground">Cadets marked present</p>
          </CardContent>
        </Card>

        <Card className="ncc-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle>
            <UserX className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absentToday}</div>
            <p className="text-xs text-muted-foreground">Cadets marked absent</p>
          </CardContent>
        </Card>

        <Card className="ncc-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">Overall attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="ncc-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{activity.cadetName}</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                {getActivityBadge(activity.action)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="ncc-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-success/10">
              <span className="font-medium">Present</span>
              <span className="text-success font-bold">{stats.presentToday} cadets</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-destructive/10">
              <span className="font-medium">Absent</span>
              <span className="text-destructive font-bold">{stats.absentToday} cadets</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-warning/10">
              <span className="font-medium">On Leave</span>
              <span className="text-warning font-bold">{stats.onLeave} cadets</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Attendance Rate</span>
                <span className="text-accent text-lg">{stats.attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;