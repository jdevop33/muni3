import React from 'react';
import { BarChart, Calendar, Activity, TrendingUp, Briefcase, Award } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600">Review performance metrics and insights for Oak Bay council activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Meeting Metrics</h2>
            <Calendar className="text-[#0056a6] h-5 w-5" />
          </div>
          <p className="text-gray-600 mb-4 text-sm">Track meeting frequency, duration, and attendance over time</p>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Decision Analysis</h2>
            <Activity className="text-[#0056a6] h-5 w-5" />
          </div>
          <p className="text-gray-600 mb-4 text-sm">View decision outcomes, categories, and implementation status</p>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Topic Trends</h2>
            <TrendingUp className="text-[#0056a6] h-5 w-5" />
          </div>
          <p className="text-gray-600 mb-4 text-sm">Identify emerging topics and track discussion frequency</p>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Engagement Metrics</h2>
            <Briefcase className="text-[#0056a6] h-5 w-5" />
          </div>
          <p className="text-gray-600 mb-4 text-sm">Track council and public engagement with key initiatives</p>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Performance Indicators</h2>
            <Award className="text-[#0056a6] h-5 w-5" />
          </div>
          <p className="text-gray-600 mb-4 text-sm">Measure progress against strategic objectives and KPIs</p>
          <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;