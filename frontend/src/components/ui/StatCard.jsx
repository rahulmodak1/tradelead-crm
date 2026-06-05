import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, iconColor, trend, trendValue, index = 0 }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500';

  return (
    <div
      className="stat-card animate-slide-up"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards', opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{subtitle}</p>
        {trendValue && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={12} />
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
