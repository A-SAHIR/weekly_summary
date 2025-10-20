import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from "lucide-react";
import * as XLSX from "xlsx";

export interface TicketDataEntry {
  category: string;
  tickets: number;
  blockages: number;
  storyPoints: number;
  complexity: string[];
  deadlineState: string[];
}

interface DataEntryFormProps {
  onSubmit: (data: TicketDataEntry[]) => void;
}

export function DataEntryForm({ onSubmit }: DataEntryFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<TicketDataEntry[] | null>(null);

  const parseComplexityString = (complexityStr: string): string[] => {
    if (!complexityStr) return [];
    
    // Clean invisible characters and normalize string
    const cleanedStr = complexityStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    
    // Split by space and filter to get only complexity levels
    const items = cleanedStr.split(/\s+/);
    const complexityLevels: string[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if current item is a complexity level
      if (["Trivial", "Facile", "Difficile"].includes(item)) {
        // Check if previous item is a number (count)
        const prevItem = i > 0 ? items[i - 1] : null;
        const count = prevItem && /^\d+$/.test(prevItem) ? parseInt(prevItem) : 1;
        
        // Add the complexity level 'count' times
        for (let j = 0; j < count; j++) {
          complexityLevels.push(item);
        }
      }
    }
    
    return complexityLevels;
  };

  const parseDeadlineString = (deadlineStr: string): string[] => {
    if (!deadlineStr) return [];
    // Extract all "Avant" and "Après" occurrences
    const matches = deadlineStr.match(/(Avant|Après)/g);
    return matches || [];
  };

  const downloadTemplate = () => {
    // Create sample data for the template
    const templateData = [
      {
        "Catégorie": "Exemple 1",
        "Compteur des Tickets": 5,
        "Compteur de blockages": 2,
        "Story Points": 13,
        "Complexité": "2 Trivial 2 Facile 1 Difficile",
        "Deadline state": "3 Avant 2 Après"
      },
      {
        "Catégorie": "Exemple 2",
        "Compteur des Tickets": 8,
        "Compteur de blockages": 1,
        "Story Points": 21,
        "Complexité": "3 Facile 5 Difficile",
        "Deadline state": "5 Avant 3 Après"
      },
      {
        "Catégorie": "Exemple 3",
        "Compteur des Tickets": 3,
        "Compteur de blockages": 0,
        "Story Points": 8,
        "Complexité": "3 Trivial",
        "Deadline state": "2 Avant 1 Après"
      }
    ];

    // Create a new workbook and add the template data
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Données Hebdomadaires");

    // Set column widths for better readability
    const maxWidth = 25;
    worksheet['!cols'] = [
      { wch: maxWidth },
      { wch: maxWidth },
      { wch: maxWidth },
      { wch: 15 },
      { wch: maxWidth },
      { wch: maxWidth }
    ];

    // Generate and download the file
    XLSX.writeFile(workbook, "template_tickets_hebdomadaires.xlsx");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setError("");
    setSuccess(false);
    setParsedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        console.log(jsonData);
        

        if (jsonData.length === 0) {
          setError("Le fichier Excel est vide");
          return;
        }

        // Clean invisible characters from keys
        const cleanedData = jsonData.map(row => {
          const cleanedRow: any = {};
          Object.keys(row).forEach(key => {
            // Remove invisible characters like zero-width space (U+200B)
            const cleanKey = key.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            cleanedRow[cleanKey] = row[key];
          });
          return cleanedRow;
        });

        // Parse the Excel data
        const ticketEntries: TicketDataEntry[] = cleanedData.map((row) => {
          // Handle different possible column names
          const category = row["Catégorie"] || row["Categorie"] || row["Category"] || "";
          const tickets = parseInt(row["Compteur des Tickets"] || row["Tickets"] || "0");
          const blockages = parseInt(row["Compteur de blockages"] || row["Blocages"] || row["Blockages"] || "0");
          const storyPoints = parseInt(row["Story Points"] || row["SP"] || "0");
          const complexityStr = row["Complexité"] || row["Complexite"] || row["Complexity"] || "";
          const deadlineStr = row["Deadline state"] || row["Deadline State"] || row["État Deadline"] || "";

          return {
            category: category.toString(),
            tickets: isNaN(tickets) ? 0 : tickets,
            blockages: isNaN(blockages) ? 0 : blockages,
            storyPoints: isNaN(storyPoints) ? 0 : storyPoints,
            complexity: parseComplexityString(complexityStr.toString()),
            deadlineState: parseDeadlineString(deadlineStr.toString()),
          };
        });

        // Validate parsed data
        console.log(ticketEntries);
        
        const validEntries = ticketEntries.filter(
          (entry) => entry.category.trim() !== ""
        );

        if (validEntries.length === 0) {
          setError("Aucune donnée valide trouvée dans le fichier");
          return;
        }

        setParsedData(validEntries);
        setSuccess(true);
      } catch (err) {
        setError("Erreur lors de la lecture du fichier. Assurez-vous qu'il s'agit d'un fichier Excel valide.");
        console.error(err);
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const handleSubmit = () => {
    if (parsedData && parsedData.length > 0) {
      onSubmit(parsedData);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1>Téléchargement des Données Hebdomadaires</h1>
          <p className="text-muted-foreground">
            Importez votre fichier Excel contenant les données des tickets résolus
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Format du Fichier Excel</CardTitle>
            <CardDescription>
              Votre fichier doit contenir les colonnes suivantes :
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Catégorie</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Compteur des Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Compteur de blockages</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Story Points</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Complexité</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span>Deadline state</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={downloadTemplate} 
                variant="outline" 
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le Modèle Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Cliquez pour sélectionner un fichier Excel
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Formats acceptés: .xlsx, .xls
                    </p>
                  </div>
                </Label>
              </div>

              {file && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && parsedData && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    Fichier chargé avec succès! {parsedData.length} catégorie(s) trouvée(s).
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {parsedData && parsedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu des Données</CardTitle>
              <CardDescription>
                Vérifiez que les données sont correctement importées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsedData.map((entry, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg text-sm space-y-1"
                  >
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Catégorie:</span>
                      <span>{entry.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tickets:</span>
                      <span>{entry.tickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Story Points:</span>
                      <span>{entry.storyPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {parsedData && parsedData.length > 0 && (
          <Button onClick={handleSubmit} className="w-full" size="lg">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Générer le Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
