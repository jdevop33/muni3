import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileType, Map, Image as ImageIcon, PenTool } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from '@/lib/queryClient';

interface AnalysisResult {
  title?: string;
  description?: string;
  summary?: string;
  keyPoints?: string[];
  topics?: string[];
  tags?: string[];
  regions?: { name: string; description: string }[];
  keyFeatures?: { name: string; type: string; description: string }[];
  locations?: { name: string; description?: string }[];
  impactedAreas?: string[];
  recommendations?: string[];
  confidence?: number;
}

export default function MultimodalPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("document");
  const [isLoading, setIsLoading] = useState(false);
  
  // Document analysis
  const [documentText, setDocumentText] = useState("");
  const [documentType, setDocumentType] = useState("meeting minutes");
  const [documentResult, setDocumentResult] = useState<AnalysisResult | null>(null);
  
  // Image analysis
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageResult, setImageResult] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Map analysis
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [mapContext, setMapContext] = useState("");
  const [mapResult, setMapResult] = useState<AnalysisResult | null>(null);
  const [mapPreview, setMapPreview] = useState<string | null>(null);
  
  // Location extraction
  const [locationText, setLocationText] = useState("");
  const [locationResult, setLocationResult] = useState<any[] | null>(null);
  
  // Visualization generator
  const [visualPrompt, setVisualPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleDocumentAnalysis = async () => {
    if (!documentText) {
      toast({
        title: "Missing content",
        description: "Please enter document text to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/multimodal/analyze-document', {
        text: documentText,
        documentType: documentType
      });
      
      const result = await response.json();
      setDocumentResult(result);
      toast({
        title: "Analysis complete",
        description: "Document has been successfully analyzed"
      });
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalysis = async () => {
    if (!imageFile) {
      toast({
        title: "Missing image",
        description: "Please select an image to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (imagePrompt) {
        formData.append('prompt', imagePrompt);
      }
      
      const response = await fetch('/api/multimodal/analyze-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const result = await response.json();
      setImageResult(result);
      toast({
        title: "Analysis complete",
        description: "Image has been successfully analyzed"
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMapFile(file);
      
      // Create map preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMapPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapAnalysis = async () => {
    if (!mapFile) {
      toast({
        title: "Missing map",
        description: "Please select a map image to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('map', mapFile);
      if (mapContext) {
        formData.append('context', mapContext);
      }
      
      const response = await fetch('/api/multimodal/analyze-map', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze map');
      }
      
      const result = await response.json();
      setMapResult(result);
      toast({
        title: "Analysis complete",
        description: "Map has been successfully analyzed"
      });
    } catch (error) {
      console.error('Error analyzing map:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze map. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationExtraction = async () => {
    if (!locationText) {
      toast({
        title: "Missing content",
        description: "Please enter text to extract locations from",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/multimodal/extract-locations', {
        text: locationText
      });
      
      const result = await response.json();
      setLocationResult(result.locations || []);
      toast({
        title: "Extraction complete",
        description: "Locations have been successfully extracted"
      });
    } catch (error) {
      console.error('Error extracting locations:', error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract locations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVisualization = async () => {
    if (!visualPrompt) {
      toast({
        title: "Missing prompt",
        description: "Please enter a description of the visualization you want to generate",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/multimodal/generate-visualization', {
        prompt: visualPrompt
      });
      
      const result = await response.json();
      if (result.url) {
        setGeneratedImage(result.url);
        toast({
          title: "Generation complete",
          description: "Visualization has been successfully generated"
        });
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error generating visualization:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate visualization. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multimodal Analysis</h1>
        <p className="text-muted-foreground">
          Analyze documents, images, maps and extract locations with AI-powered analysis.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileType className="h-4 w-4" />
            <span className="hidden sm:inline">Document</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Image</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Map</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Locations</span>
          </TabsTrigger>
          <TabsTrigger value="visualize" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Visualize</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Document Analysis Tab */}
        <TabsContent value="document">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Analysis</CardTitle>
                <CardDescription>
                  Extract key information from meeting minutes, proposals, or any text document.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type</Label>
                    <Input 
                      id="documentType"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      placeholder="E.g., meeting minutes, proposal, report"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentText">Document Text</Label>
                    <Textarea 
                      id="documentText"
                      value={documentText}
                      onChange={(e) => setDocumentText(e.target.value)}
                      placeholder="Paste the document text here..."
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleDocumentAnalysis} 
                  disabled={isLoading || !documentText}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : "Analyze Document"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Key information extracted from your document.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documentResult ? (
                  <div className="space-y-4">
                    {documentResult.title && (
                      <div>
                        <h3 className="font-semibold">Title</h3>
                        <p>{documentResult.title}</p>
                      </div>
                    )}
                    
                    {documentResult.summary && (
                      <div>
                        <h3 className="font-semibold">Summary</h3>
                        <p>{documentResult.summary}</p>
                      </div>
                    )}
                    
                    {documentResult.keyPoints && documentResult.keyPoints.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Key Points</h3>
                        <ul className="list-disc pl-5">
                          {documentResult.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {documentResult.topics && documentResult.topics.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          {documentResult.topics.map((topic, index) => (
                            <span 
                              key={index}
                              className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {documentResult.locations && documentResult.locations.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Locations</h3>
                        <ul className="list-disc pl-5">
                          {documentResult.locations.map((location, index) => (
                            <li key={index}>
                              <strong>{location.name}</strong>
                              {location.description && (
                                <span> - {location.description}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {documentResult.recommendations && documentResult.recommendations.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Recommendations</h3>
                        <ul className="list-disc pl-5">
                          {documentResult.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border rounded-md border-dashed">
                    <p className="text-muted-foreground">
                      Analysis results will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Image Analysis Tab */}
        <TabsContent value="image">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Analysis</CardTitle>
                <CardDescription>
                  Analyze images from council meetings, public spaces, or municipal events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageFile">Upload Image</Label>
                    <Input 
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {imagePreview && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full object-contain max-h-[200px]"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="imagePrompt">Analysis Prompt (Optional)</Label>
                    <Input 
                      id="imagePrompt"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="E.g., focus on buildings, identify key features"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleImageAnalysis} 
                  disabled={isLoading || !imageFile}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : "Analyze Image"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Key information extracted from your image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageResult ? (
                  <div className="space-y-4">
                    {imageResult.description && (
                      <div>
                        <h3 className="font-semibold">Description</h3>
                        <p>{imageResult.description}</p>
                      </div>
                    )}
                    
                    {imageResult.tags && imageResult.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {imageResult.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {imageResult.locations && imageResult.locations.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Identified Locations</h3>
                        <ul className="list-disc pl-5">
                          {imageResult.locations.map((location, index) => (
                            <li key={index}>
                              <strong>{location.name}</strong>
                              {location.description && (
                                <span> - {location.description}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {imageResult.confidence !== undefined && (
                      <div>
                        <h3 className="font-semibold">Confidence</h3>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${imageResult.confidence * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(imageResult.confidence * 100)}% confidence
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border rounded-md border-dashed">
                    <p className="text-muted-foreground">
                      Analysis results will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Map Analysis Tab */}
        <TabsContent value="map">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Map Analysis</CardTitle>
                <CardDescription>
                  Analyze maps of Oak Bay neighborhoods, zoning plans, or development proposals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mapFile">Upload Map</Label>
                    <Input 
                      id="mapFile"
                      type="file"
                      accept="image/*"
                      onChange={handleMapChange}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {mapPreview && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="border rounded-md overflow-hidden">
                        <img 
                          src={mapPreview} 
                          alt="Map Preview" 
                          className="w-full object-contain max-h-[200px]"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="mapContext">Map Context (Optional)</Label>
                    <Textarea 
                      id="mapContext"
                      value={mapContext}
                      onChange={(e) => setMapContext(e.target.value)}
                      placeholder="E.g., this is a zoning map for the Central Oak Bay neighborhood"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleMapAnalysis} 
                  disabled={isLoading || !mapFile}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : "Analyze Map"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Key information extracted from your map.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mapResult ? (
                  <div className="space-y-4">
                    {mapResult.summary && (
                      <div>
                        <h3 className="font-semibold">Summary</h3>
                        <p>{mapResult.summary}</p>
                      </div>
                    )}
                    
                    {mapResult.regions && mapResult.regions.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Regions</h3>
                        <ul className="list-disc pl-5">
                          {mapResult.regions.map((region, index) => (
                            <li key={index}>
                              <strong>{region.name}</strong> - {region.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {mapResult.keyFeatures && mapResult.keyFeatures.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Key Features</h3>
                        <ul className="list-disc pl-5">
                          {mapResult.keyFeatures.map((feature, index) => (
                            <li key={index}>
                              <strong>{feature.name}</strong> ({feature.type}) - {feature.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {mapResult.impactedAreas && mapResult.impactedAreas.length > 0 && (
                      <div>
                        <h3 className="font-semibold">Impacted Areas</h3>
                        <ul className="list-disc pl-5">
                          {mapResult.impactedAreas.map((area, index) => (
                            <li key={index}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border rounded-md border-dashed">
                    <p className="text-muted-foreground">
                      Analysis results will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Location Extraction Tab */}
        <TabsContent value="location">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Extraction</CardTitle>
                <CardDescription>
                  Extract location references from council minutes, reports, or any text document.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationText">Text with Locations</Label>
                    <Textarea 
                      id="locationText"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="Paste text containing location references..."
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleLocationExtraction} 
                  disabled={isLoading || !locationText}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extracting...
                    </>
                  ) : "Extract Locations"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Extracted Locations</CardTitle>
                <CardDescription>
                  Location references extracted from your text.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {locationResult && locationResult.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Found {locationResult.length} location references:
                    </p>
                    
                    <div className="divide-y">
                      {locationResult.map((location, index) => (
                        <div key={index} className="py-3">
                          <h3 className="font-semibold">{location.name}</h3>
                          {location.type && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Type: {location.type}
                            </p>
                          )}
                          {location.context && (
                            <p className="text-sm">{location.context}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : locationResult && locationResult.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">
                      No locations found in the provided text
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border rounded-md border-dashed">
                    <p className="text-muted-foreground">
                      Extracted locations will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Visualization Generator Tab */}
        <TabsContent value="visualize">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Visualization</CardTitle>
                <CardDescription>
                  Create custom visualizations for council presentations, reports, or public outreach.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="visualPrompt">Visualization Description</Label>
                    <Textarea 
                      id="visualPrompt"
                      value={visualPrompt}
                      onChange={(e) => setVisualPrompt(e.target.value)}
                      placeholder="Describe the visualization you'd like to generate..."
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateVisualization} 
                  disabled={isLoading || !visualPrompt}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Visualization"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Generated Image</CardTitle>
                <CardDescription>
                  Your custom visualization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={generatedImage} 
                        alt="Generated Visualization" 
                        className="w-full object-contain"
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <a 
                        href={generatedImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open full size in new tab
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border rounded-md border-dashed">
                    <p className="text-muted-foreground">
                      Generated visualization will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}