import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  Crown, 
  Flame, 
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  Lightbulb
} from "lucide-react";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  requirement?: string;
}

interface GamificationBadgeProps {
  badge: BadgeData;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  award: Award,
  crown: Crown,
  flame: Flame,
  book: BookOpen,
  users: Users,
  calendar: Calendar,
  check: CheckCircle,
  lightbulb: Lightbulb
};

const rarityStyles = {
  common: "bg-gray-100 border-gray-300 text-gray-700",
  rare: "bg-blue-100 border-blue-300 text-blue-700",
  epic: "bg-purple-100 border-purple-300 text-purple-700",
  legendary: "bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 text-yellow-800 shadow-lg"
};

const rarityGlow = {
  common: "",
  rare: "shadow-blue-200",
  epic: "shadow-purple-200", 
  legendary: "shadow-yellow-200 shadow-lg"
};

export function GamificationBadge({ badge, size = 'md', showProgress = true }: GamificationBadgeProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Award;
  
  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-20 h-24", 
    lg: "w-24 h-28"
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  };

  return (
    <Card className={`${sizeClasses[size]} ${badge.earned ? 'opacity-100' : 'opacity-50'} 
                     ${rarityStyles[badge.rarity]} ${rarityGlow[badge.rarity]} 
                     hover:scale-105 transition-all duration-200 cursor-pointer`}>
      <CardContent className="p-2 h-full flex flex-col items-center justify-center text-center">
        <div className="relative">
          <IconComponent className={`${iconSizes[size]} mx-auto mb-1`} />
          {badge.earned && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        
        <div className={`text-xs font-medium ${size === 'sm' ? 'text-[10px]' : ''}`}>
          {badge.name}
        </div>
        
        {showProgress && badge.progress !== undefined && !badge.earned && (
          <div className="w-full mt-1">
            <div className="bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${badge.progress}%` }}
              />
            </div>
            <div className="text-[8px] text-gray-500 mt-1">{badge.progress}%</div>
          </div>
        )}

        {badge.earned && badge.earnedDate && size !== 'sm' && (
          <div className="text-[8px] text-gray-500 mt-1">
            {new Date(badge.earnedDate).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}