import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TicketCheck, AlertCircle, Target, CalendarDays, Edit } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "./ui/button";
import { WeeklyData } from "./DataEntryForm";

interface DashboardProps {
  weeklyData: WeeklyData;
  onEdit: () => void;
}

const COLORS = ['#646cff', '#22c55e', '#f59e0b', '#ef4444'];

const getComplexityColor = (complexity: string) => {
  if (complexity === "Difficile") return "destructive";
  if (complexity === "Moyen") return "default";
  if (complexity === "Facile") return "secondary";
  return "outline"; // Trivial
};

const getDeadlineColor = (state: string) => {
  if (state === "Avant") return "default";
  if (state === "Sur") return "secondary";
  return "outline"; // Après
};

export function Dashboard({ weeklyData, onEdit }: DashboardProps) {
  const ticketData = weeklyData.tickets;
  
  // Calculate totals
  const totalTickets = ticketData.reduce((sum, item) => sum + item.tickets, 0);
  const totalBlockages = ticketData.reduce((sum, item) => sum + item.blockages, 0);
  const totalStoryPoints = ticketData.reduce((sum, item) => sum + item.storyPoints, 0);

  // Calculate deadline stats
  const deadlineStats = ticketData.reduce((acc, item) => {
    item.deadlineState.forEach(state => {
      if (state === "Avant") acc.avant += 1;
      else if (state === "Après") acc.apres += 1;
      else if (state === "Sur") acc.sur += 1;
    });
    return acc;
  }, { avant: 0, apres: 0, sur: 0 });

  // Data for charts
  const chartData = ticketData.map(item => ({
    name: item.category,
    tickets: item.tickets,
    storyPoints: item.storyPoints,
    blockages: item.blockages,
  }));

  // Complexity distribution
  const complexityCount = ticketData.reduce((acc, item) => {
    item.complexity.forEach(c => {
      acc[c] = (acc[c] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const complexityData = Object.entries(complexityCount).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="bg-muted/30 p-4 overflow-hidden">
      <div className="h-full flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <div>
              <h2>Résumé Hebdomadaire - {weeklyData.personName}</h2>
              <p className="text-muted-foreground text-sm">Semaine passée</p>
            </div>
          </div>
          
          {/* Inline Summary Cards */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
              <TicketCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tickets</p>
                <p className="font-medium">{totalTickets}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Story Points</p>
                <p className="font-medium">{totalStoryPoints}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Blocages</p>
                <p className="font-medium">{totalBlockages}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Bar Chart */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base">Tickets & Story Points</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-muted-foreground" 
                    style={{ fontSize: '10px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis className="text-muted-foreground" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="tickets" fill="#646cff" name="Tickets" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="storyPoints" fill="#22c55e" name="Story Points" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Complexity Distribution */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base">Distribution Complexité</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={complexityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '11px' }}
                  >
                    {complexityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Table at Bottom */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">Détails des Tickets</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-4 pb-4 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">Catégorie</TableHead>
                  <TableHead className="text-center text-sm">Tickets</TableHead>
                  <TableHead className="text-center text-sm">Blocages</TableHead>
                  <TableHead className="text-center text-sm">SP</TableHead>
                  <TableHead className="text-sm">Complexité</TableHead>
                  <TableHead className="text-sm">Deadline State</TableHead>
                  <TableHead className="text-sm">Projet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{item.category}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">{item.tickets}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.blockages > 0 ? (
                        <Badge variant="destructive" className="text-xs">{item.blockages}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">{item.storyPoints}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {(() => {
                          // Compter les complexités sans doublons
                          const counts = item.complexity.reduce((acc, c) => {
                            acc[c] = (acc[c] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          return Object.entries(counts).map(([complexity, count]) => (
                            <Badge key={complexity} variant={getComplexityColor(complexity)} className="text-xs">
                              {count} {complexity}
                            </Badge>
                          ));
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.deadlineState.map((state, i) => (
                          <Badge key={i} variant={getDeadlineColor(state)} className="text-xs">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {item.projects.map((project, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {project.count} {project.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
