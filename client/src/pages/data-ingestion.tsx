import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  Check, 
  Database, 
  Download, 
  FileDown, 
  FileJson, 
  FileSpreadsheet, 
  RefreshCw, 
  RotateCw, 
  Search, 
  Server,
  Upload 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for Maxun robots and jobs
interface MaxunRobot {
  id: string;
  name: string;
  url: string;
  status: string;
  lastRun?: Date;
}

interface MaxunJob {
  id: string;
  robotId: string;
  status: string;
  data: any[];
  startedAt: Date;
  finishedAt?: Date;
}

export default function DataIngestionPage() {
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [uploadType, setUploadType] = useState<"meetings" | "decisions" | "topics">("meetings");
  const [uploadData, setUploadData] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { toast } = useToast();

  // Fetch robots from Maxun
  const {
    data: robots,
    isLoading: robotsLoading,
    error: robotsError,
    refetch: refetchRobots
  } = useQuery({
    queryKey: ["/api/maxun/robots"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch job details when a job is selected
  const {
    data: jobDetails,
    isLoading: jobDetailsLoading,
    refetch: refetchJobDetails
  } = useQuery({
    queryKey: ["/api/maxun/jobs", selectedJobId],
    enabled: !!selectedJobId,
  });

  // Run robot mutation
  const runRobotMutation = useMutation({
    mutationFn: (robotId: string) => {
      return apiRequest(`/api/maxun/robots/${robotId}/run`, "POST");
    },
    onSuccess: (data) => {
      setSelectedJobId(data.jobId);
      toast({
        title: "Robot started",
        description: `Data extraction job started. Job ID: ${data.jobId}`,
      });
      // Invalidate robot list to refresh status
      queryClient.invalidateQueries({ queryKey: ["/api/maxun/robots"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to run robot",
        description: "There was an error starting the data extraction job.",
        variant: "destructive",
      });
    }
  });

  // Sync data mutation
  const syncDataMutation = useMutation({
    mutationFn: (jobId: string) => {
      setSyncStatus("loading");
      return apiRequest(`/api/maxun/sync/${jobId}`, "POST");
    },
    onSuccess: () => {
      setSyncStatus("success");
      toast({
        title: "Data synchronized",
        description: "The extracted data has been successfully imported into the database.",
      });
      // Invalidate data lists to refresh
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/decisions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
    },
    onError: () => {
      setSyncStatus("error");
      toast({
        title: "Sync failed",
        description: "There was an error importing the data into the database.",
        variant: "destructive",
      });
    }
  });

  // Direct data upload mutation
  const uploadDataMutation = useMutation({
    mutationFn: () => {
      setUploadStatus("loading");
      try {
        // Parse the JSON data
        const jsonData = JSON.parse(uploadData);
        // Upload based on selected type
        return apiRequest(`/api/${uploadType}/upload`, "POST", { data: jsonData });
      } catch (e) {
        throw new Error("Invalid JSON format");
      }
    },
    onSuccess: () => {
      setUploadStatus("success");
      toast({
        title: "Data uploaded",
        description: `${uploadType} data has been successfully imported into the database.`,
      });
      // Invalidate relevant data lists to refresh
      queryClient.invalidateQueries({ queryKey: [`/api/${uploadType}`] });
    },
    onError: (error) => {
      setUploadStatus("error");
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading the data.",
        variant: "destructive",
      });
    }
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let variant = "outline";
    
    if (status === "running" || status === "pending") variant = "secondary";
    if (status === "completed" || status === "success") variant = "default";
    if (status === "failed" || status === "error") variant = "destructive";
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Data Ingestion</h1>
        <p className="text-muted-foreground">
          This page allows you to extract data from the Oak Bay municipal website using Maxun robots
          and synchronize it with the CouncilInsight database.
        </p>

        <Tabs defaultValue="robots" className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="robots">Robots</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="upload">Direct Upload</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="robots" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Available Robots</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchRobots()}
                disabled={robotsLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {robotsLoading && (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <p>Loading robots...</p>
                </div>
              </div>
            )}

            {robotsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load robots. Make sure your Maxun server is running and properly configured.
                </AlertDescription>
              </Alert>
            )}

            {robots?.robots && robots.robots.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No robots found</AlertTitle>
                <AlertDescription>
                  You need to create robots in Maxun to extract data from the Oak Bay website.
                  Visit your Maxun instance to create and configure robots.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {robots?.robots && robots.robots.map((robot: MaxunRobot) => (
                <Card 
                  key={robot.id} 
                  className={`cursor-pointer ${selectedRobotId === robot.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedRobotId(robot.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{robot.name}</CardTitle>
                      <StatusBadge status={robot.status} />
                    </div>
                    <CardDescription>
                      <span className="block truncate">{robot.url}</span>
                      {robot.lastRun && (
                        <span className="text-xs">
                          Last run: {new Date(robot.lastRun).toLocaleString()}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        runRobotMutation.mutate(robot.id);
                      }}
                      disabled={runRobotMutation.isPending}
                      className="w-full"
                    >
                      {runRobotMutation.isPending && runRobotMutation.variables === robot.id ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Run Robot
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Direct Data Upload</h2>
              <div className="flex space-x-2">
                <TabsList className="bg-muted">
                  <TabsTrigger 
                    value="meetings" 
                    onClick={() => setUploadType("meetings")}
                    className={uploadType === "meetings" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Meetings
                  </TabsTrigger>
                  <TabsTrigger 
                    value="decisions" 
                    onClick={() => setUploadType("decisions")}
                    className={uploadType === "decisions" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Decisions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="topics" 
                    onClick={() => setUploadType("topics")}
                    className={uploadType === "topics" ? "bg-primary text-primary-foreground" : ""}
                  >
                    Topics
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upload {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} Data</CardTitle>
                <CardDescription>
                  Directly upload {uploadType} data in JSON format to populate the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="data-upload">JSON Data</Label>
                    <Textarea
                      id="data-upload"
                      placeholder={`Enter ${uploadType} JSON data...`}
                      value={uploadData}
                      onChange={(e) => setUploadData(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      Paste your JSON data following the schema format for {uploadType}
                    </p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // Empty template data based on selected type
                          let templateData = [];
                          if (uploadType === "meetings") {
                            templateData = [
                              {
                                "title": "Regular Council Meeting",
                                "type": "Regular",
                                "date": "2025-01-15T19:00:00.000Z",
                                "startTime": "19:00",
                                "duration": "2h 30m",
                                "status": "Scheduled",
                                "topics": ["Housing", "Environment", "Transportation"],
                                "participants": 8,
                                "hasVideo": true,
                                "hasTranscript": true,
                                "hasMinutes": true
                              }
                            ];
                          } else if (uploadType === "decisions") {
                            templateData = [
                              {
                                "meetingId": 1,
                                "title": "Motion to Approve Zoning Change",
                                "description": "Approved zoning change for 123 Oak Bay Ave",
                                "date": "2025-01-15T19:00:00.000Z",
                                "meeting": "Regular Council Meeting",
                                "meetingType": "Regular",
                                "topics": ["Housing", "Urban Planning"],
                                "votesFor": 5,
                                "votesAgainst": 2,
                                "status": "Approved",
                                "type": "Motion"
                              }
                            ];
                          } else if (uploadType === "topics") {
                            templateData = [
                              {
                                "name": "Climate Action",
                                "count": 12,
                                "lastDiscussed": "2025-01-15T19:00:00.000Z"
                              }
                            ];
                          }
                          
                          setUploadData(JSON.stringify(templateData, null, 2));
                        }}
                      >
                        <FileJson className="h-4 w-4 mr-2" />
                        Load Template
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          try {
                            // Format the JSON with proper indentation
                            const formatted = JSON.stringify(JSON.parse(uploadData), null, 2);
                            setUploadData(formatted);
                            toast({
                              title: "JSON Formatted",
                              description: "Your JSON data has been formatted.",
                            });
                          } catch (e) {
                            toast({
                              title: "Invalid JSON",
                              description: "Please check your JSON syntax.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Format JSON
                      </Button>
                    </div>
                    
                    <Button
                      onClick={() => uploadDataMutation.mutate()}
                      disabled={uploadDataMutation.isPending || !uploadData.trim()}
                      className="w-full"
                    >
                      {uploadDataMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Data
                        </>
                      )}
                    </Button>
                  </div>

                  {uploadStatus === "success" && (
                    <Alert className="mt-4" variant="default">
                      <Check className="h-4 w-4" />
                      <AlertTitle>Success</AlertTitle>
                      <AlertDescription>
                        {uploadType.charAt(0).toUpperCase() + uploadType.slice(1)} data has been successfully uploaded to the database.
                      </AlertDescription>
                    </Alert>
                  )}

                  {uploadStatus === "error" && (
                    <Alert className="mt-4" variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Failed to upload data. Please check your JSON format and try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk CSV Import</CardTitle>
                <CardDescription>
                  Import data from CSV files exported from the Oak Bay website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid w-full gap-2">
                    <Label htmlFor="csv-file">Upload CSV File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                      />
                      <Button disabled>
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Job Details</h2>
              <div className="flex space-x-2">
                <div className="flex-grow">
                  <Input
                    type="text"
                    placeholder="Enter Job ID"
                    value={selectedJobId || ''}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => refetchJobDetails()}
                  disabled={!selectedJobId || jobDetailsLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {!selectedJobId && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No job selected</AlertTitle>
                <AlertDescription>
                  Enter a job ID or run a robot to see job details.
                </AlertDescription>
              </Alert>
            )}

            {selectedJobId && jobDetailsLoading && (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <p>Loading job details...</p>
                </div>
              </div>
            )}

            {jobDetails?.job && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Job: {jobDetails.job.id}</CardTitle>
                    <StatusBadge status={jobDetails.job.status} />
                  </div>
                  <CardDescription>
                    Robot ID: {jobDetails.job.robotId}
                    <div className="text-xs mt-1">
                      Started: {new Date(jobDetails.job.startedAt).toLocaleString()}
                      {jobDetails.job.finishedAt && (
                        <span>, Finished: {new Date(jobDetails.job.finishedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Job Results</h3>
                      {jobDetails.job.status === 'completed' ? (
                        <div>
                          <p>{jobDetails.job.data?.length || 0} items extracted</p>
                          <div className="mt-4">
                            <Button
                              onClick={() => syncDataMutation.mutate(jobDetails.job.id)}
                              disabled={syncStatus === "loading"}
                              className="w-full"
                            >
                              {syncStatus === "loading" ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Syncing Data...
                                </>
                              ) : (
                                <>
                                  <RotateCw className="mr-2 h-4 w-4" />
                                  Sync to Database
                                </>
                              )}
                            </Button>

                            {syncStatus === "success" && (
                              <Alert className="mt-4" variant="default">
                                <Check className="h-4 w-4" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>
                                  Data successfully synchronized to the database.
                                </AlertDescription>
                              </Alert>
                            )}

                            {syncStatus === "error" && (
                              <Alert className="mt-4" variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                  Failed to synchronize data. Please try again.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Job not completed</AlertTitle>
                          <AlertDescription>
                            The job is still running or has failed. Wait for it to complete before syncing.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Maxun Connection Settings</CardTitle>
                <CardDescription>
                  Configure the connection to your Maxun instance for data extraction.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maxun-url">Maxun URL</Label>
                    <Input
                      id="maxun-url"
                      type="text"
                      placeholder="http://localhost:8080"
                      defaultValue={process.env.MAXUN_URL || 'http://localhost:8080'}
                    />
                    <p className="text-sm text-muted-foreground">
                      The URL where your Maxun instance is running
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxun-username">Username</Label>
                    <Input
                      id="maxun-username"
                      type="text"
                      placeholder="admin@example.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="maxun-password">Password</Label>
                    <Input
                      id="maxun-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Run Maxun Locally</h4>
                      <p className="text-sm text-muted-foreground">
                        To run Maxun locally, follow these steps:
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
                        <li>Clone the Maxun repository from GitHub</li>
                        <li>Copy .env.example to .env and configure settings</li>
                        <li>Run with Docker Compose: docker-compose up</li>
                        <li>Access the Maxun UI at http://localhost:5173</li>
                        <li>Create robots to scrape the Oak Bay website</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Server className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Synchronization</CardTitle>
                <CardDescription>
                  Control how extracted data is synchronized with the CouncilInsight database.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-medium">Database Status</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Database className="h-4 w-4 mr-2" />
                        Connected to PostgreSQL Database
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}