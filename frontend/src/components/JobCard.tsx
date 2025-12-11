import { Bookmark, CheckCircle, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Job } from '../App';

interface JobCardProps {
  job: Job;
  onSave: (job: Job) => void;
  onApply: (job: Job) => void;
  onChoose: (job: Job) => void;
  isSaved: boolean;
  isApplied: boolean;
}

export default function JobCard({ job, onSave, onApply, onChoose, isSaved, isApplied }: JobCardProps) {
  const handleSave = () => {
    if (!isSaved) {
      onSave(job);
      toast.success('Job saved successfully!');
    } else {
      toast.info('Job already saved');
    }
  };

  const handleApply = () => {
    if (!isApplied) {
      onApply(job);
      toast.success('Application submitted successfully!', {
        description: `You've applied to ${job.title} at ${job.company}`,
      });
    } else {
      toast.info('You already applied to this job');
    }
  };

  const handleChoose = () => {
    onChoose(job);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-gray-900">{job.title}</h3>
            {isApplied && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                Applied
              </span>
            )}
            {isSaved && !isApplied && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                Saved
              </span>
            )}
          </div>
          <p className="text-gray-900">{job.company}</p>
        </div>
        <button
          onClick={handleSave}
          className={`p-2 rounded-lg transition-colors ${
            isSaved
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isSaved ? 'Saved' : 'Save job'}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Job Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span className="text-sm">{job.role}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm">{job.salary}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-3">{job.description}</p>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleChoose}
          className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Choose
        </button>
        <button
          onClick={handleApply}
          disabled={isApplied}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            isApplied
              ? 'bg-green-100 text-green-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isApplied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Applied
            </>
          ) : (
            'Apply'
          )}
        </button>
      </div>
    </div>
  );
}
