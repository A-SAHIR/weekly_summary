import { useState } from "react";
import { DataEntryForm, WeeklyData } from "./components/DataEntryForm";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);

  const handleDataSubmit = (data: WeeklyData) => {
    setWeeklyData(data);
  };

  const handleEdit = () => {
    setWeeklyData(null);
  };

  if (!weeklyData) {
    return <DataEntryForm onSubmit={handleDataSubmit} />;
  }

  return <Dashboard weeklyData={weeklyData} onEdit={handleEdit} />;
}
