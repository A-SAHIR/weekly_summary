import { useState } from "react";
import { DataEntryForm, TicketDataEntry } from "./components/DataEntryForm";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [ticketData, setTicketData] = useState<TicketDataEntry[] | null>(null);

  const handleDataSubmit = (data: TicketDataEntry[]) => {
    setTicketData(data);
  };

  const handleEdit = () => {
    setTicketData(null);
  };

  if (!ticketData) {
    return <DataEntryForm onSubmit={handleDataSubmit} />;
  }

  return <Dashboard ticketData={ticketData} onEdit={handleEdit} />;
}
