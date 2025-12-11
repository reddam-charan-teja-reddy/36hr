import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, User, Briefcase, BookmarkCheck, MessageSquare } from 'lucide-react';
import { Job, Chat, UserProfile } from '../App';

interface HomePageProps {
  savedJobs: Job[];
  appliedJobs: Job[];
  chats: Chat[];
  userProfile: UserProfile | null;
}

export default function HomePage({ savedJobs, appliedJobs, chats, userProfile }: HomePageProps) {
  const navigate = useNavigate();

  const handleNewChat = () => {
    const chatId = `chat-${Date.now()}`;
    navigate(`/chat/${chatId}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-gray-900">JobBot</h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {userProfile?.profilePhoto ? (
              <img
                src={userProfile.profilePhoto}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
            <span className="text-gray-700">{userProfile?.name || 'Profile'}</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2">Welcome back, {userProfile?.name?.split(' ')[0]}!</h2>
          <p className="text-gray-600">Find your dream job with AI-powered assistance</p>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full mb-8 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          <MessageSquarePlus className="w-6 h-6" />
          <span>Start New Job Search Chat</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Saved Jobs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookmarkCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900">Saved Jobs</h3>
                <p className="text-gray-500 text-sm">{savedJobs.length} jobs saved</p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {savedJobs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No saved jobs yet</p>
              ) : (
                savedJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => navigate('/chat')}
                  >
                    <p className="text-gray-900">{job.title}</p>
                    <p className="text-gray-600 text-sm">{job.company}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Applied Jobs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900">Applied Jobs</h3>
                <p className="text-gray-500 text-sm">{appliedJobs.length} applications</p>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {appliedJobs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No applications yet</p>
              ) : (
                appliedJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors cursor-pointer"
                    onClick={() => navigate('/chat')}
                  >
                    <p className="text-gray-900">{job.title}</p>
                    <p className="text-gray-600 text-sm">{job.company}</p>
                    <div className="mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Applied
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Previous Chats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Previous Chats</h3>
              <p className="text-gray-500 text-sm">{chats.length} conversations</p>
            </div>
          </div>
          <div className="space-y-3">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No previous chats</p>
                <button
                  onClick={handleNewChat}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Your First Chat
                </button>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-900">{chat.title}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {chat.messages.length} messages
                      </p>
                    </div>
                    <span className="text-gray-400 text-sm">{formatDate(chat.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
