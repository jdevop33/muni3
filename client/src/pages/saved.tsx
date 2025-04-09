import React, { useState } from 'react';
import { Bookmark, Calendar, CheckCircle, LightbulbIcon, MessageSquare, FileText, FolderPlus, ListFilter, Trash2 } from 'lucide-react';

const SavedPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [savedItems, setSavedItems] = useState([
    {
      id: 1,
      title: 'Council Meeting - March 28, 2024',
      excerpt: 'Regular council meeting discussing budget allocations, community grants, and the new recreation center proposal.',
      date: 'Mar 28, 2024',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Housing Affordability Task Force Recommendations',
      excerpt: 'Comprehensive report outlining 12 key recommendations to address housing affordability in Oak Bay.',
      date: 'Mar 15, 2024',
      type: 'document'
    },
    {
      id: 3,
      title: 'Approval of Pedestrian Safety Improvements',
      excerpt: 'Council approved funding for pedestrian safety improvements at key intersections throughout Oak Bay.',
      date: 'Mar 10, 2024',
      type: 'decision'
    },
    {
      id: 4,
      title: 'Urban Forest Management',
      excerpt: 'Tracking discussions related to tree preservation, new plantings, and green space enhancement.',
      date: 'Feb 22, 2024',
      type: 'topic'
    },
    {
      id: 5,
      title: 'Recreation Center Design Consultation',
      excerpt: 'Public input session on design elements and amenities for the proposed recreation center.',
      date: 'Feb 15, 2024',
      type: 'meeting'
    },
    {
      id: 6,
      title: 'Climate Action Implementation Plan',
      excerpt: 'Detailed plan for implementing climate action initiatives throughout Oak Bay over the next five years.',
      date: 'Feb 8, 2024',
      type: 'document'
    }
  ]);

  const [collections, setCollections] = useState([
    {
      id: 1,
      name: 'Recreation Projects',
      count: 3
    },
    {
      id: 2,
      name: 'Housing Research',
      count: 2
    },
    {
      id: 3,
      name: 'Transportation',
      count: 1
    }
  ]);

  const getFilteredItems = () => {
    if (activeTab === 'all') return savedItems;
    return savedItems.filter(item => item.type === activeTab);
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'meeting':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'decision':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'topic':
        return <LightbulbIcon className="h-5 w-5 text-amber-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <Bookmark className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Saved Items</h1>
        <p className="text-gray-600">Access your bookmarked council meetings, topics, and documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button 
                  className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'all' ? 'border-[#0056a6] text-[#0056a6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Items
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'meeting' ? 'border-[#0056a6] text-[#0056a6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('meeting')}
                >
                  Meetings
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'decision' ? 'border-[#0056a6] text-[#0056a6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('decision')}
                >
                  Decisions
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'topic' ? 'border-[#0056a6] text-[#0056a6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('topic')}
                >
                  Topics
                </button>
                <button 
                  className={`px-4 py-3 font-medium text-sm border-b-2 ${activeTab === 'document' ? 'border-[#0056a6] text-[#0056a6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('document')}
                >
                  Documents
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {getFilteredItems().map(item => (
                <div key={item.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-base font-medium text-gray-800">{item.title}</h3>
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-[#0056a6]">
                            <FolderPlus className="h-5 w-5" />
                          </button>
                          <button className="text-gray-400 hover:text-red-500">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.excerpt}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-gray-500">{item.date}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-4 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">My Collections</h2>
              <button className="text-sm text-white bg-[#0056a6] hover:bg-[#004e95] px-3 py-1.5 rounded flex items-center">
                <FolderPlus className="h-4 w-4 mr-1" /> New
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {collections.map(collection => (
                <a 
                  key={collection.id}
                  href="#" 
                  className="p-4 flex items-center justify-between hover:bg-gray-50 block"
                >
                  <div className="flex items-center">
                    <Bookmark className="h-5 w-5 text-[#0056a6] mr-3" />
                    <span className="text-sm font-medium text-gray-800">{collection.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {collection.count}
                  </span>
                </a>
              ))}
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">6 total saved items</span>
                <button className="text-sm text-[#0056a6] hover:text-[#004e95] flex items-center">
                  <ListFilter className="h-4 w-4 mr-1" /> Sort
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#e6f1f9] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#0056a6] mb-2 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" /> Pro Tip
            </h3>
            <p className="text-sm text-gray-700">
              Save items for quick access later. Add notes and organize items into collections for research and reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedPage;