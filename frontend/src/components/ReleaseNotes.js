import React, { useState } from 'react';
import { useReleases } from '../hooks/useReleases';
import { Calendar, GitCommit, Users, Tag, ChevronDown, ChevronRight, Star, Bug, Zap, Wrench, AlertTriangle } from 'lucide-react';

const ReleaseNotes = () => {
  const { releases, loading, error, getLatestRelease, getTotalChanges } = useReleases();
  const [expandedReleases, setExpandedReleases] = useState(new Set());

  const toggleRelease = (version) => {
    const newExpanded = new Set(expandedReleases);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedReleases(newExpanded);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getCategoryIcon = (category, count) => {
    if (count === 0) return null;
    
    const iconProps = { size: 16, className: `inline mr-1` };
    
    switch (category) {
      case 'features':
        return <Star {...iconProps} className="text-green-500 inline mr-1" />;
      case 'fixes':
        return <Bug {...iconProps} className="text-red-500 inline mr-1" />;
      case 'improvements':
        return <Zap {...iconProps} className="text-blue-500 inline mr-1" />;
      case 'breaking':
        return <AlertTriangle {...iconProps} className="text-orange-500 inline mr-1" />;
      default:
        return <Wrench {...iconProps} className="text-gray-500 inline mr-1" />;
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      features: 'Features',
      fixes: 'Bug Fixes',
      improvements: 'Improvements',
      breaking: 'Breaking Changes',
      chores: 'Other Changes'
    };
    return labels[category] || category;
  };

  const renderCommitsByCategory = (commits, summary) => {
    const categories = ['breaking', 'features', 'fixes', 'improvements', 'chores'];
    
    return categories.map(category => {
      const count = summary[category] || 0;
      if (count === 0) return null;
      
      const categoryCommits = commits.filter(commit => {
        const subject = commit.subject.toLowerCase();
        switch (category) {
          case 'breaking':
            return subject.includes('breaking');
          case 'features':
            return subject.startsWith('feat') || subject.includes('feature') || subject.includes('add ');
          case 'fixes':
            return subject.startsWith('fix') || subject.includes('bug') || subject.includes('resolve');
          case 'improvements':
            return subject.startsWith('improve') || subject.includes('enhance') || subject.includes('update');
          default:
            return !subject.includes('version bump') && !subject.includes('chore: version');
        }
      });

      return (
        <div key={category} className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            {getCategoryIcon(category, count)}
            {getCategoryLabel(category)} ({count})
          </h4>
          <ul className="space-y-1 ml-6">
            {categoryCommits.slice(0, 10).map((commit, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <GitCommit size={12} className="text-gray-400 mt-1 mr-2 flex-shrink-0" />
                <span className="flex-1">
                  {commit.subject}
                  <span className="text-xs text-gray-400 ml-2">({commit.hash})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="loading mx-auto mb-4"></div>
        <p>Loading release notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No Release Notes Available</h3>
          <p className="text-gray-600">Release notes will appear here after your first version deployment.</p>
        </div>
      </div>
    );
  }

  const latestRelease = getLatestRelease();

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Release Notes</h1>
          <p className="text-gray-600">
            Track all changes and improvements across versions
          </p>
        </div>
        
        {latestRelease && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Tag size={16} />
              <span className="font-semibold">Latest: v{latestRelease.version}</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {formatDate(latestRelease.date)}
            </div>
          </div>
        )}
      </div>

      {/* Release Stats */}
      <div className="grid grid-3 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="text-purple-500" size={20} />
            <h3 className="font-semibold">Total Releases</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">{releases.length}</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <GitCommit className="text-green-500" size={20} />
            <h3 className="font-semibold">Total Changes</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">{getTotalChanges()}</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-500" size={20} />
            <h3 className="font-semibold">Contributors</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {[...new Set(releases.flatMap(r => r.commits?.map(c => c.author) || []))].length}
          </p>
        </div>
      </div>

      {/* Releases List */}
      <div className="space-y-4">
        {releases.length === 0 ? (
          <div className="card text-center py-8">
            <Tag className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Releases Yet</h3>
            <p className="text-gray-600">
              Release notes will appear here after your first deployment with version tracking.
            </p>
          </div>
        ) : (
          releases.map((release, index) => {
            const isExpanded = expandedReleases.has(release.version);
            const isLatest = index === 0;
            
            return (
              <div 
                key={release.version} 
                className={`card ${isLatest ? 'border-2 border-blue-200 bg-blue-50' : ''}`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleRelease(release.version)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">
                          v{release.version}
                          {isLatest && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              Latest
                            </span>
                          )}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(release.date)}
                        </span>
                        {release.summary && (
                          <span className="flex items-center gap-1">
                            <GitCommit size={14} />
                            {release.summary.total} changes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {release.summary && (
                    <div className="flex items-center gap-4 text-sm">
                      {release.summary.features > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          {getCategoryIcon('features')}
                          {release.summary.features}
                        </span>
                      )}
                      {release.summary.fixes > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          {getCategoryIcon('fixes')}
                          {release.summary.fixes}
                        </span>
                      )}
                      {release.summary.improvements > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          {getCategoryIcon('improvements')}
                          {release.summary.improvements}
                        </span>
                      )}
                      {release.summary.breaking > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          {getCategoryIcon('breaking')}
                          {release.summary.breaking}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {release.commits && release.commits.length > 0 ? (
                      <div>
                        <h4 className="font-semibold mb-4">Changes in this release:</h4>
                        {renderCommitsByCategory(release.commits, release.summary || {})}
                        
                        {/* Contributors */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Users size={16} className="text-gray-500 mr-1" />
                            Contributors
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {[...new Set(release.commits.map(c => c.author))].map(author => (
                              <span 
                                key={author}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {author}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 italic">No detailed changes recorded for this release.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReleaseNotes; 