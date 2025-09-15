import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, UserCheck, UserX, Clock, Download } from "lucide-react";

interface Cadet {
  id: string;
  name: string;
  rank: string;
  regNumber: string;
  company: string;
  phone: string;
  attendanceStatus: 'present' | 'absent' | 'leave';
  attendanceRate: number;
}

const CadetRoster = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");

  // Mock data - in real app this would come from API/database
  const cadets: Cadet[] = [
    { id: '1', name: 'Cadet Sharma, Rajesh', rank: 'Sergeant', regNumber: 'NCC/2024/001', company: 'A Company', phone: '+91 9876543210', attendanceStatus: 'present', attendanceRate: 95.2 },
    { id: '2', name: 'Cadet Singh, Priya', rank: 'Corporal', regNumber: 'NCC/2024/002', company: 'B Company', phone: '+91 9876543211', attendanceStatus: 'present', attendanceRate: 92.8 },
    { id: '3', name: 'Cadet Kumar, Arjun', rank: 'Lance Corporal', regNumber: 'NCC/2024/003', company: 'A Company', phone: '+91 9876543212', attendanceStatus: 'leave', attendanceRate: 88.5 },
    { id: '4', name: 'Cadet Patel, Meera', rank: 'Cadet', regNumber: 'NCC/2024/004', company: 'C Company', phone: '+91 9876543213', attendanceStatus: 'present', attendanceRate: 96.7 },
    { id: '5', name: 'Cadet Gupta, Vikram', rank: 'Sergeant', regNumber: 'NCC/2024/005', company: 'B Company', phone: '+91 9876543214', attendanceStatus: 'absent', attendanceRate: 85.3 },
    { id: '6', name: 'Cadet Joshi, Anita', rank: 'Corporal', regNumber: 'NCC/2024/006', company: 'A Company', phone: '+91 9876543215', attendanceStatus: 'present', attendanceRate: 94.1 },
    { id: '7', name: 'Cadet Reddy, Suresh', rank: 'Cadet', regNumber: 'NCC/2024/007', company: 'C Company', phone: '+91 9876543216', attendanceStatus: 'present', attendanceRate: 91.4 },
    { id: '8', name: 'Cadet Nair, Kavya', rank: 'Lance Corporal', regNumber: 'NCC/2024/008', company: 'B Company', phone: '+91 9876543217', attendanceStatus: 'absent', attendanceRate: 87.9 },
  ];

  const companies = ['A Company', 'B Company', 'C Company'];

  const filteredCadets = cadets.filter(cadet => {
    const matchesSearch = cadet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadet.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadet.rank.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || cadet.attendanceStatus === filterStatus;
    const matchesCompany = filterCompany === "all" || cadet.company === filterCompany;
    
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="ncc-badge-present flex items-center gap-1"><UserCheck className="h-3 w-3" />Present</Badge>;
      case 'absent':
        return <Badge className="ncc-badge-absent flex items-center gap-1"><UserX className="h-3 w-3" />Absent</Badge>;
      case 'leave':
        return <Badge className="ncc-badge-leave flex items-center gap-1"><Clock className="h-3 w-3" />On Leave</Badge>;
      default:
        return null;
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-success';
    if (rate >= 75) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Cadet Roster</h1>
        <p className="text-muted-foreground">Manage cadet information and attendance records</p>
      </div>

      {/* Filters and Search */}
      <Card className="ncc-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, registration number, or rank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
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
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cadet Table */}
      <Card className="ncc-card">
        <CardHeader>
          <CardTitle>Cadet List ({filteredCadets.length} cadets)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Rank</TableHead>
                  <TableHead className="font-semibold">Reg. Number</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Attendance Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCadets.map((cadet) => (
                  <TableRow key={cadet.id} className="ncc-table-row">
                    <TableCell className="font-medium">{cadet.name}</TableCell>
                    <TableCell>{cadet.rank}</TableCell>
                    <TableCell className="font-mono text-sm">{cadet.regNumber}</TableCell>
                    <TableCell>{cadet.company}</TableCell>
                    <TableCell className="font-mono text-sm">{cadet.phone}</TableCell>
                    <TableCell>{getStatusBadge(cadet.attendanceStatus)}</TableCell>
                    <TableCell className={`text-right font-semibold ${getAttendanceRateColor(cadet.attendanceRate)}`}>
                      {cadet.attendanceRate}%
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

export default CadetRoster;