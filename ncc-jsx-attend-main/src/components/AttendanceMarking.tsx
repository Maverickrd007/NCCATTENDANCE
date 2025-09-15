import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCheck, UserX, Clock, Save, RotateCcw } from "lucide-react";

interface AttendanceCadet {
  id: string;
  name: string;
  rank: string;
  regNumber: string;
  company: string;
  status: 'present' | 'absent' | 'leave' | 'unmarked';
}

const AttendanceMarking = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock data - in real app this would come from API/database
  const [cadets, setCadets] = useState<AttendanceCadet[]>([
    { id: '1', name: 'Cadet Sharma, Rajesh', rank: 'Sergeant', regNumber: 'NCC/2024/001', company: 'A Company', status: 'unmarked' },
    { id: '2', name: 'Cadet Singh, Priya', rank: 'Corporal', regNumber: 'NCC/2024/002', company: 'B Company', status: 'unmarked' },
    { id: '3', name: 'Cadet Kumar, Arjun', rank: 'Lance Corporal', regNumber: 'NCC/2024/003', company: 'A Company', status: 'unmarked' },
    { id: '4', name: 'Cadet Patel, Meera', rank: 'Cadet', regNumber: 'NCC/2024/004', company: 'C Company', status: 'unmarked' },
    { id: '5', name: 'Cadet Gupta, Vikram', rank: 'Sergeant', regNumber: 'NCC/2024/005', company: 'B Company', status: 'unmarked' },
    { id: '6', name: 'Cadet Joshi, Anita', rank: 'Corporal', regNumber: 'NCC/2024/006', company: 'A Company', status: 'unmarked' },
    { id: '7', name: 'Cadet Reddy, Suresh', rank: 'Cadet', regNumber: 'NCC/2024/007', company: 'C Company', status: 'unmarked' },
    { id: '8', name: 'Cadet Nair, Kavya', rank: 'Lance Corporal', regNumber: 'NCC/2024/008', company: 'B Company', status: 'unmarked' },
  ]);

  const companies = ['A Company', 'B Company', 'C Company'];

  const filteredCadets = cadets.filter(cadet => {
    const matchesSearch = cadet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadet.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadet.rank.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = filterCompany === "all" || cadet.company === filterCompany;
    
    return matchesSearch && matchesCompany;
  });

  const updateAttendance = (cadetId: string, status: AttendanceCadet['status']) => {
    setCadets(prev => 
      prev.map(cadet => 
        cadet.id === cadetId ? { ...cadet, status } : cadet
      )
    );
    setHasUnsavedChanges(true);
  };

  const markAllPresent = () => {
    setCadets(prev => 
      prev.map(cadet => ({ ...cadet, status: 'present' as const }))
    );
    setHasUnsavedChanges(true);
    toast({
      title: "All Cadets Marked Present",
      description: "All cadets have been marked as present. Don't forget to save changes.",
    });
  };

  const resetAttendance = () => {
    setCadets(prev => 
      prev.map(cadet => ({ ...cadet, status: 'unmarked' as const }))
    );
    setHasUnsavedChanges(false);
    toast({
      title: "Attendance Reset",
      description: "All attendance marks have been reset.",
    });
  };

  const saveAttendance = () => {
    // In real app, this would save to API/database
    setHasUnsavedChanges(false);
    toast({
      title: "Attendance Saved",
      description: `Attendance for ${selectedDate} has been saved successfully.`,
    });
  };

  const getStatusBadge = (status: AttendanceCadet['status']) => {
    switch (status) {
      case 'present':
        return <Badge className="ncc-badge-present flex items-center gap-1"><UserCheck className="h-3 w-3" />Present</Badge>;
      case 'absent':
        return <Badge className="ncc-badge-absent flex items-center gap-1"><UserX className="h-3 w-3" />Absent</Badge>;
      case 'leave':
        return <Badge className="ncc-badge-leave flex items-center gap-1"><Clock className="h-3 w-3" />On Leave</Badge>;
      case 'unmarked':
        return <Badge variant="outline" className="text-muted-foreground">Unmarked</Badge>;
      default:
        return null;
    }
  };

  const getStatusCounts = () => {
    const present = cadets.filter(c => c.status === 'present').length;
    const absent = cadets.filter(c => c.status === 'absent').length;
    const leave = cadets.filter(c => c.status === 'leave').length;
    const unmarked = cadets.filter(c => c.status === 'unmarked').length;
    
    return { present, absent, leave, unmarked };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
        <p className="text-muted-foreground">Record daily attendance for all cadets</p>
      </div>

      {/* Date Selection and Quick Actions */}
      <Card className="ncc-card">
        <CardHeader>
          <CardTitle>Attendance for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground">Select Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button
                variant="outline"
                onClick={markAllPresent}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Mark All Present
              </Button>
              <Button
                variant="outline"
                onClick={resetAttendance}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </Button>
              <Button
                onClick={saveAttendance}
                disabled={!hasUnsavedChanges}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Attendance
              </Button>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning">You have unsaved changes. Don't forget to save your attendance records.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="ncc-stat-card border border-success/20">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{statusCounts.present}</div>
              <div className="text-sm text-muted-foreground">Present</div>
            </div>
          </CardContent>
        </Card>
        <Card className="ncc-stat-card border border-destructive/20">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{statusCounts.absent}</div>
              <div className="text-sm text-muted-foreground">Absent</div>
            </div>
          </CardContent>
        </Card>
        <Card className="ncc-stat-card border border-warning/20">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{statusCounts.leave}</div>
              <div className="text-sm text-muted-foreground">On Leave</div>
            </div>
          </CardContent>
        </Card>
        <Card className="ncc-stat-card border border-muted/20">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{statusCounts.unmarked}</div>
              <div className="text-sm text-muted-foreground">Unmarked</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="ncc-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cadets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="ncc-card">
        <CardHeader>
          <CardTitle>Cadet Attendance ({filteredCadets.length} cadets)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCadets.map((cadet) => (
                  <TableRow key={cadet.id} className="ncc-table-row">
                    <TableCell>
                      <div>
                        <div className="font-medium">{cadet.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{cadet.regNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{cadet.rank}</TableCell>
                    <TableCell>{cadet.company}</TableCell>
                    <TableCell>{getStatusBadge(cadet.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant={cadet.status === 'present' ? 'default' : 'outline'}
                          onClick={() => updateAttendance(cadet.id, 'present')}
                          className="h-8"
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={cadet.status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => updateAttendance(cadet.id, 'absent')}
                          className="h-8"
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={cadet.status === 'leave' ? 'secondary' : 'outline'}
                          onClick={() => updateAttendance(cadet.id, 'leave')}
                          className="h-8"
                        >
                          Leave
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredCadets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No cadets found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceMarking;