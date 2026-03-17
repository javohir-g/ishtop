import { Bookmark } from "lucide-react";

interface JobCardProps {
  logo: React.ReactNode;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  isBookmarked?: boolean;
  isRecommendation?: boolean;
}

export function JobCard({
  logo,
  title,
  company,
  location,
  salary,
  tags,
  isBookmarked = false,
  isRecommendation = false,
}: JobCardProps) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center shadow-sm shrink-0 bg-white">
          {logo}
        </div>
        <div className="flex-1 pt-0.5">
          <div className="flex items-start justify-between mb-1">
            <h4 className={`${isRecommendation ? 'text-base' : 'text-base'} font-semibold text-gray-900 leading-tight`}>
              {title}
            </h4>
            <button className="text-blue-600">
              <Bookmark
                strokeWidth={1.5}
                className={`w-5 h-5 ${isBookmarked ? 'fill-blue-600' : ''}`}
              />
            </button>
          </div>
          <p className="text-gray-500 text-sm">{company}</p>
        </div>
      </div>
      
      <div className="h-px bg-gray-100 w-full my-3"></div>
      
      <div className="pl-[3.75rem]">
        <p className="text-gray-600 text-sm">{location}</p>
        <p className={`text-blue-600 text-base font-semibold mt-1`}>
          {salary} <span className="text-sm font-normal">/month</span>
        </p>
        <div className="flex gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border border-gray-300 text-gray-600 px-2.5 py-0.5 rounded-lg text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}