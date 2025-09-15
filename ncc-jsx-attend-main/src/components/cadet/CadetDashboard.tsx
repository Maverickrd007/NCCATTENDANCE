
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { apiService, Cadet, AttendanceRecord } from "@/services/api";

interface CadetDashboardProps {
  currentCadet: Cadet;
  onUpdateAttendance: (status: Cadet['attendanceStatus']) => void;
}

const CadetDashboard = ({ currentCadet, onUpdateAttendance }: CadetDashboardProps) => {
  const { toast } = useToast();
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [presentCadets, setPresentCadets] = useState<AttendanceRecord[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalPresent: 0,
    totalCadets: 0,
    myCompanyPresent: 0,
  });

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [todayAttendance, overviewStats] = await Promise.all([
          apiService.getTodayAttendance(),
          apiService.getDashboardOverview()
        ]);

        setPresentCadets(todayAttendance.attendance.filter(a => a.status === 'present'));
        setDashboardStats({
          totalPresent: overviewStats.attendance.present,
          totalCadets: overviewStats.totalCadets,
          myCompanyPresent: todayAttendance.attendance.filter(a => 
            a.status === 'present' && a.company === currentCadet.company
          ).length,
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [currentCadet.company]);

  const handleMarkAttendance = async (status: Cadet['attendanceStatus']) => {
    setIsMarkingAttendance(true);
    
    try {
      await apiService.markAttendance({ status });
      onUpdateAttendance(status);
      
      const statusText = status === 'present' ? 'Present' : 
                        status === 'absent' ? 'Absent' : 'On Leave';
      
      toast({
        title: "Attendance Marked",
        description: `You have been marked as ${statusText} for today.`,
        variant: status === 'present' ? 'default' : 'destructive',
      });

      // Refresh dashboard data
      const [todayAttendance, overviewStats] = await Promise.all([
        apiService.getTodayAttendance(),
        apiService.getDashboardOverview()
      ]);

      setPresentCadets(todayAttendance.attendance.filter(a => a.status === 'present'));
      setDashboardStats({
        totalPresent: overviewStats.attendance.present,
        totalCadets: overviewStats.totalCadets,
        myCompanyPresent: todayAttendance.attendance.filter(a => 
          a.status === 'present' && a.company === currentCadet.company
        ).length,
      });
    } catch (error) {
      toast({
        title: "Failed to Mark Attendance",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const getAttendanceStatusBadge = (status: Cadet['attendanceStatus']) => {
    switch (status) {
      case 'present':
        return <Badge className="ncc-badge-present flex items-center gap-1"><UserCheck className="h-3 w-3" />Present</Badge>;
      case 'absent':
        return <Badge className="ncc-badge-absent flex items-center gap-1"><XCircle className="h-3 w-3" />Absent</Badge>;
      case 'leave':
        return <Badge className="ncc-badge-leave flex items-center gap-1"><Clock className="h-3 w-3" />On Leave</Badge>;
      case 'unmarked':
        return <Badge variant="outline" className="text-warning border-warning/20">Attendance Pending</Badge>;
      default:
        return null;
    }
  };

  const canMarkAttendance = currentCadet.attendanceStatus === 'unmarked';
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome, {currentCadet.name}</h1>
        <p className="text-muted-foreground">
          {currentDate} • {currentCadet.rank} • {currentCadet.company}
        </p>
      </div>

      {/* Attendance Status Card */}
      <Card className="ncc-card border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Attendance Status</span>
            {getAttendanceStatusBadge(currentCadet.attendanceStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {canMarkAttendance ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">Please mark your attendance for today:</p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={() => handleMarkAttendance('present')}
                  disabled={isMarkingAttendance}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Present
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleMarkAttendance('absent')}
                  disabled={isMarkingAttendance}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Mark Absent
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleMarkAttendance('leave')}
                  disabled={isMarkingAttendance}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Mark Leave
                </Button>
              </div>
              {isMarkingAttendance && (
                <p className="text-sm text-muted-foreground">Marking attendance...</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Attendance has been recorded for today.
              </p>
              <p className="text-xs text-muted-foreground">
                Contact your commanding officer if you need to update your status.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="ncc-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Present Today</CardTitle>
            <Users className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{dashboardStats.totalPresent}</div>
            <p className="text-xs text-muted-foreground">Out of {dashboardStats.totalCadets} cadets</p>
          </CardContent>
        </Card>

        <Card className="ncc-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Company Present</CardTitle>
            <UserCheck className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{dashboardStats.myCompanyPresent}</div>
            <p className="text-xs text-muted-foreground">{currentCadet.company} members</p>
          </CardContent>
        </Card>

        <Card className="ncc-stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            <Calendar className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {dashboardStats.totalCadets > 0 ? Math.round((dashboardStats.totalPresent / dashboardStats.totalCadets) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Overall today</p>
          </CardContent>
        </Card>
      </div>

      {/* Present Cadets List */}
      <Card className="ncc-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Cadets Present Today ({presentCadets.length + (currentCadet.attendanceStatus === 'present' ? 1 : 0)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Show current cadet if present */}
            {currentCadet.attendanceStatus === 'present' && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-success">{currentCadet.name} (You)</div>
                    <div className="text-xs text-muted-foreground">{currentCadet.regNumber} • {currentCadet.company}</div>
                  </div>
                  <Badge className="ncc-badge-present text-xs">Present</Badge>
                </div>
              </div>
            )}
            
            {/* Show other present cadets */}
            {presentCadets.map((cadet) => (
              <div key={cadet.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{cadet.name}</div>
                    <div className="text-xs text-muted-foreground">{cadet.regNumber} • {cadet.company}</div>
                  </div>
                  <div className="text-right">
                    <Badge className="ncc-badge-present text-xs">Present</Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(cadet.markedAt).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {presentCadets.length === 0 && currentCadet.attendanceStatus !== 'present' && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No cadets have marked attendance yet today.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CadetDashboard;