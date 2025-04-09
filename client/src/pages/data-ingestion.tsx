import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Upload, Database, FileText, Zap, Globe } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

const DataIngestionPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [municipalUrl, setMunicipalUrl] = useState('');
  const [ingestionMethod, setIngestionMethod] = useState('adaptive');
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Check if this is an admin-only page
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            This page is only accessible to administrators. Please log in with an admin account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch robots 
  const { data: robots, isLoading: robotsLoading } = useQuery({
    queryKey: ['/api/maxun/robots'],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/maxun/robots`);
        if (!response.ok) throw new Error('Failed to fetch robots');
        return await response.json();
      } catch (error) {
        console.error('Error fetching robots:', error);
        return [];
      }
    }
  });

  // Analyze municipal website
  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/adaptive/analyze-website', { url });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze website');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: 'Website analyzed successfully',
        description: `Analysis complete for ${data.data.domain}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Analysis failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Extract data from municipal website
  const extractMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/adaptive/extract-data', { url });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to extract data from website');
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Data extracted successfully',
        description: `Extracted ${data.data.meetings?.length || 0} meetings and ${data.data.decisions?.length || 0} decisions`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Extraction failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Run a Maxun robot
  const runRobotMutation = useMutation({
    mutationFn: async ({ robotId, params }: { robotId: string, params: any }) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/maxun/robots/${robotId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to run robot');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Robot started successfully',
        description: `Job ID: ${data.jobId}, Status: ${data.status}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to run robot',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  // Handle direct file upload
  const handleUpload = async () => {
    if (!csvFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to upload',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/api/meetings/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      toast({
        title: 'Upload successful',
        description: `Uploaded ${result.count} meetings`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading the file',
        variant: 'destructive',
      });
    }
  };

  // Handle scraping a municipal website
  const handleScrape = () => {
    if (!municipalUrl) {
      toast({
        title: 'No URL provided',
        description: 'Please enter a municipal website URL',
        variant: 'destructive',
      });
      return;
    }

    if (ingestionMethod === 'adaptive') {
      analyzeMutation.mutate(municipalUrl);
    } else {
      // Find a robot that can handle this URL
      const matchingRobot = robots?.find((robot: any) => 
        robot.url && new URL(municipalUrl).hostname.includes(new URL(robot.url).hostname)
      );

      if (matchingRobot) {
        runRobotMutation.mutate({ 
          robotId: matchingRobot.id, 
          params: { url: municipalUrl } 
        });
      } else {
        toast({
          title: 'No compatible robot found',
          description: 'There is no robot configured for this municipal website',
          variant: 'destructive',
        });
      }
    }
  };

  // Handle extracting data after analysis
  const handleExtract = () => {
    if (analysisResult && analysisResult.data && analysisResult.data.domain) {
      extractMutation.mutate(municipalUrl);
    } else {
      toast({
        title: 'Analysis required',
        description: 'Please analyze the website first',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Ingestion</h1>
          <p className="text-gray-600 mt-1">
            Import municipal meeting data from various sources
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upload" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Manual Upload
          </TabsTrigger>
          <TabsTrigger value="scrape" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Web Scraping
          </TabsTrigger>
        </TabsList>

        {/* Manual Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Meeting Data</CardTitle>
              <CardDescription>
                Upload CSV files containing meeting data to import into the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="file">CSV File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-gray-500">
                    Upload a CSV file with the following columns: title, date, type, status
                  </p>
                </div>

                <div className="p-4 border border-dashed rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-gray-400 mr-3" />
                    <div>
                      <h4 className="font-medium">File Format Requirements</h4>
                      <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                        <li>CSV with headers in the first row</li>
                        <li>Required columns: title, date, type</li>
                        <li>Optional columns: status, startTime, duration, topics</li>
                        <li>Date format: YYYY-MM-DD</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCsvFile(null)}>
                Reset
              </Button>
              <Button onClick={handleUpload} disabled={!csvFile}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Web Scraping Tab */}
        <TabsContent value="scrape">
          <Card>
            <CardHeader>
              <CardTitle>Web Scraping</CardTitle>
              <CardDescription>
                Extract meeting data automatically from municipal websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">Municipal Website URL</Label>
                  <Input 
                    id="url" 
                    placeholder="https://www.municipality.gov/meetings" 
                    value={municipalUrl}
                    onChange={(e) => setMunicipalUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Enter the URL of the municipal website's meetings page
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Extraction Method</Label>
                  <RadioGroup 
                    value={ingestionMethod} 
                    onValueChange={setIngestionMethod}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adaptive" id="adaptive" />
                      <Label htmlFor="adaptive" className="font-normal cursor-pointer">
                        Adaptive LLM-Enhanced Scraper (Gemini 2.5 Pro)
                      </Label>
                    </div>
                    <div className="text-xs text-gray-500 ml-6 mb-2">
                      Dynamically analyzes new municipal websites and extracts data without predefined configuration
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="robot" id="robot" />
                      <Label htmlFor="robot" className="font-normal cursor-pointer">
                        Maxun Robot (Pre-configured)
                      </Label>
                    </div>
                    <div className="text-xs text-gray-500 ml-6">
                      Uses a pre-configured robot specific to a municipal website
                    </div>
                  </RadioGroup>
                </div>

                {analysisResult && (
                  <div className="p-4 border rounded-lg bg-green-50">
                    <h4 className="font-medium text-green-800 mb-2">Analysis Results</h4>
                    <p className="text-sm text-green-700 mb-2">
                      Successfully analyzed {analysisResult.data.domain}
                    </p>
                    <Button onClick={handleExtract} size="sm" className="mt-2">
                      <Zap className="h-4 w-4 mr-2" />
                      Extract Data
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setMunicipalUrl('');
                setAnalysisResult(null);
              }}>
                Reset
              </Button>
              <Button 
                onClick={handleScrape} 
                disabled={!municipalUrl || analyzeMutation.isPending || runRobotMutation.isPending}
              >
                {analyzeMutation.isPending || runRobotMutation.isPending ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    {ingestionMethod === 'adaptive' ? 'Analyze Website' : 'Run Robot'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {(robotsLoading || robots?.length > 0) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Available Robots</CardTitle>
                <CardDescription>
                  Pre-configured robots for specific municipal websites
                </CardDescription>
              </CardHeader>
              <CardContent>
                {robotsLoading ? (
                  <div className="text-center py-4">Loading robots...</div>
                ) : robots?.length > 0 ? (
                  <div className="divide-y">
                    {robots.map((robot: any) => (
                      <div key={robot.id} className="py-3">
                        <div className="font-medium">{robot.name}</div>
                        <div className="text-sm text-gray-500">{robot.description}</div>
                        <div className="text-xs text-gray-400 mt-1">URL: {robot.url}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">No robots configured</div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataIngestionPage;