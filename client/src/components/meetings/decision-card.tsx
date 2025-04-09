import React from 'react';
import { Decision } from '@/lib/types';

interface DecisionCardProps {
  decision: Decision;
}

const DecisionCard: React.FC<DecisionCardProps> = ({ decision }) => {
  return (
    <li className="px-5 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <span className="flex h-8 w-8 rounded-full bg-green-100 text-green-600 items-center justify-center">
            <i className="fas fa-check"></i>
          </span>
        </div>
        <div className="ml-3 flex-1">
          <div className="text-sm font-medium text-gray-900">{decision.title}</div>
          <div className="text-sm text-gray-500 mt-0.5">{decision.date} · {decision.meeting}</div>
          <div className="mt-2 text-sm text-gray-600">
            {decision.description}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {decision.topics.map((topic, index) => (
              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#e6f1f9] text-[#0056a6]">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
};

export default DecisionCard;
